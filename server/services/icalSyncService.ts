import ical from 'node-ical';
import icalGenerator, { ICalCalendarMethod } from 'ical-generator';
import { getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

/**
 * Free iCal Calendar Sync Service for RouTripO OTA
 * 
 * Capabilities:
 * 1. Inbound Sync: Fetches external iCal feeds (Airbnb, Booking.com, Agoda, Vrbo),
 *    extracts booked/blocked date ranges, and writes them into Firestore `master_hotels` (blocked_dates).
 * 2. Outbound Export: Generates RFC 5545 compliant `.ics` feed using `ical-generator`
 *    for third-party OTAs to subscribe to RouTripO property availability.
 */

export interface ICalSyncResult {
  success: boolean;
  hotelId: string;
  icalUrl: string;
  syncedEventsCount: number;
  totalBlockedDatesCount: number;
  newDatesAdded: string[];
  lastSyncedAt: string;
  error?: string;
}

// In-memory fallback if Firestore is running offline / demo mode
const memoryBlockedDates = new Map<string, Set<string>>();

/**
 * Helper to convert Date range [start, end) into an array of ISO 'YYYY-MM-DD' strings
 */
function getDateRangeArray(startDate: Date, endDate: Date): string[] {
  const dates: string[] = [];
  const current = new Date(startDate.getTime());
  
  // Set to midnight UTC
  current.setUTCHours(0, 0, 0, 0);
  const end = new Date(endDate.getTime());
  end.setUTCHours(0, 0, 0, 0);

  // If start >= end, at least block the start day
  if (current.getTime() >= end.getTime()) {
    dates.push(current.toISOString().split('T')[0]);
    return dates;
  }

  while (current < end) {
    dates.push(current.toISOString().split('T')[0]);
    current.setUTCDate(current.getUTCDate() + 1);
  }

  return dates;
}

/**
 * 1. Read external iCal link and block dates in Firebase Firestore & local cache
 */
export async function syncAndBlockDatesFromICal(hotelId: string, icalUrl: string): Promise<ICalSyncResult> {
  const nowIso = new Date().toISOString();
  if (!hotelId || !icalUrl) {
    throw new Error('Hotel ID and iCal URL are required for synchronization');
  }

  try {
    console.log(`[iCalSync] Fetching external calendar for Hotel ${hotelId} from: ${icalUrl}`);
    
    // Fetch and parse the .ics file using node-ical
    const events = await ical.async.fromURL(icalUrl);
    const dateSet = new Set<string>();
    let eventCount = 0;

    for (const key in events) {
      if (Object.prototype.hasOwnProperty.call(events, key)) {
        const event = events[key];
        if (event && event.type === 'VEVENT' && event.start && event.end) {
          eventCount++;
          const range = getDateRangeArray(new Date(event.start), new Date(event.end));
          range.forEach(d => dateSet.add(d));
        }
      }
    }

    const newBlockedDates = Array.from(dateSet).sort();

    // Update in-memory cache
    if (!memoryBlockedDates.has(hotelId)) {
      memoryBlockedDates.set(hotelId, new Set<string>());
    }
    const memSet = memoryBlockedDates.get(hotelId)!;
    newBlockedDates.forEach(d => memSet.add(d));

    // Update Firebase Firestore if initialized
    let firestoreUpdated = false;
    if (getApps().length > 0) {
      try {
        const db = getFirestore();
        const hotelRef = db.collection('master_hotels').doc(hotelId);
        
        if (newBlockedDates.length > 0) {
          await hotelRef.set({
            blocked_dates: FieldValue.arrayUnion(...newBlockedDates),
            last_ical_sync: nowIso,
            ical_feed_url: icalUrl,
            updated_at: nowIso
          }, { merge: true });
        } else {
          await hotelRef.set({
            last_ical_sync: nowIso,
            ical_feed_url: icalUrl,
            updated_at: nowIso
          }, { merge: true });
        }
        firestoreUpdated = true;
      } catch (dbErr) {
        console.warn(`[iCalSync] Firestore update failed, fallback to in-memory:`, dbErr);
      }
    }

    console.log(`[iCalSync] Successfully synced ${eventCount} events (${newBlockedDates.length} blocked dates) for hotel ${hotelId}`);

    return {
      success: true,
      hotelId,
      icalUrl,
      syncedEventsCount: eventCount,
      totalBlockedDatesCount: memSet.size,
      newDatesAdded: newBlockedDates,
      lastSyncedAt: nowIso
    };
  } catch (error: any) {
    console.error(`[iCalSync] Error syncing iCal for hotel ${hotelId}:`, error);
    return {
      success: false,
      hotelId,
      icalUrl,
      syncedEventsCount: 0,
      totalBlockedDatesCount: memoryBlockedDates.get(hotelId)?.size || 0,
      newDatesAdded: [],
      lastSyncedAt: nowIso,
      error: error.message || 'Unknown iCal sync error'
    };
  }
}

/**
 * 2. Generate RouTripO outbound iCal feed (.ics) for third-party platforms (Airbnb, Booking.com, etc.)
 */
export async function generateHotelICalFeed(hotelId: string, hotelName: string = 'RouTripO Partner Hotel'): Promise<string> {
  const calendar = icalGenerator({
    name: `${hotelName} - Availability Calendar`,
    prodId: { company: 'RouTripO Travel Technologies', product: 'RouTripO-OTA-iCal' },
    method: ICalCalendarMethod.PUBLISH,
    timezone: 'Asia/Kolkata',
    url: `https://routripo.com/api/hotels/${hotelId}/calendar.ics`
  });

  const datesToBlock = new Set<string>();

  // Add memory dates
  if (memoryBlockedDates.has(hotelId)) {
    memoryBlockedDates.get(hotelId)!.forEach(d => datesToBlock.add(d));
  }

  // Fetch Firestore blocked_dates & active bookings
  if (getApps().length > 0) {
    try {
      const db = getFirestore();
      const doc = await db.collection('master_hotels').doc(hotelId).get();
      if (doc.exists) {
        const data = doc.data();
        if (Array.isArray(data?.blocked_dates)) {
          data.blocked_dates.forEach((d: string) => datesToBlock.add(d));
        }
      }

      // Also fetch confirmed reservations for this hotel
      const bookingsSnap = await db.collection('bookings')
        .where('hotel_id', '==', hotelId)
        .where('status', 'in', ['CONFIRMED', 'PAID', 'CHECKED_IN'])
        .get();

      bookingsSnap.forEach(bDoc => {
        const b = bDoc.data();
        if (b.check_in && b.check_out) {
          const startDate = new Date(b.check_in);
          const endDate = new Date(b.check_out);
          calendar.createEvent({
            id: `booking-${bDoc.id}@routripo.com`,
            start: startDate,
            end: endDate,
            summary: `Reserved (RouTripO Booking #${bDoc.id.slice(0, 8)})`,
            description: `Guest reservation via RouTripO OTA`,
            allDay: true
          });
        }
      });
    } catch (err) {
      console.warn(`[iCalSync] Could not fetch Firestore bookings for calendar export:`, err);
    }
  }

  // Group contiguous blocked dates into single events
  const sortedDates = Array.from(datesToBlock).sort();
  if (sortedDates.length > 0) {
    let currentStart = sortedDates[0];
    let currentEnd = sortedDates[0];

    for (let i = 1; i < sortedDates.length; i++) {
      const prev = new Date(currentEnd);
      prev.setUTCDate(prev.getUTCDate() + 1);
      const expectedNext = prev.toISOString().split('T')[0];

      if (sortedDates[i] === expectedNext) {
        currentEnd = sortedDates[i];
      } else {
        // Emit previous range
        const s = new Date(currentStart);
        const e = new Date(currentEnd);
        e.setUTCDate(e.getUTCDate() + 1); // ICS all-day end date is exclusive
        calendar.createEvent({
          id: `blocked-${hotelId}-${currentStart}@routripo.com`,
          start: s,
          end: e,
          summary: 'Unavailable / Closed Dates',
          description: 'Dates blocked via RouTripO Channel Calendar Sync',
          allDay: true
        });

        currentStart = sortedDates[i];
        currentEnd = sortedDates[i];
      }
    }

    // Emit final range
    const s = new Date(currentStart);
    const e = new Date(currentEnd);
    e.setUTCDate(e.getUTCDate() + 1);
    calendar.createEvent({
      id: `blocked-${hotelId}-${currentStart}@routripo.com`,
      start: s,
      end: e,
      summary: 'Unavailable / Closed Dates',
      description: 'Dates blocked via RouTripO Channel Calendar Sync',
      allDay: true
    });
  }

  return calendar.toString();
}

/**
 * Get currently blocked dates for a given hotel (from Firestore or in-memory)
 */
export async function getBlockedDatesForHotel(hotelId: string): Promise<string[]> {
  const dates = new Set<string>();

  if (memoryBlockedDates.has(hotelId)) {
    memoryBlockedDates.get(hotelId)!.forEach(d => dates.add(d));
  }

  if (getApps().length > 0) {
    try {
      const db = getFirestore();
      const doc = await db.collection('master_hotels').doc(hotelId).get();
      if (doc.exists) {
        const data = doc.data();
        if (Array.isArray(data?.blocked_dates)) {
          data.blocked_dates.forEach((d: string) => dates.add(d));
        }
      }
    } catch (err) {
      console.warn(`[iCalSync] Error reading blocked dates:`, err);
    }
  }

  return Array.from(dates).sort();
}
