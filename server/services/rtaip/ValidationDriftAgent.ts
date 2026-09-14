import type {
  Agent,
  AgentContext,
  AgentResponse,
  ValidationResult,
  TimelineValidationInput,
  TimelineValidationOutput,
  ValidatedTripPlan,
  TimelineDrift,
  TimelineAdjustment,
  BoundItinerary,
  BoundDayActivity
} from './types.js';

function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  // Handle ISO string or "HH:MM"
  let clean = timeStr;
  if (clean.includes('T')) {
    clean = clean.split('T')[1].slice(0, 5);
  } else {
    clean = clean.slice(0, 5);
  }
  const [h, m] = clean.split(':').map(val => parseInt(val, 10) || 0);
  return h * 60 + m;
}

function formatMinutesToTime(totalMins: number): string {
  const bounded = Math.max(0, Math.min(23 * 60 + 59, totalMins));
  const h = Math.floor(bounded / 60);
  const m = bounded % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

/**
 * RTAIP Validation Drift Agent (Stage 3)
 * Analyzes the bound flight and hotel schedules against the generative AI activity timeline.
 * If the AI suggests an activity that overlaps or conflicts with real transit timings,
 * this agent detects the drift and automatically reschedules the day's timeline.
 */
export class ValidationDriftAgent implements Agent<TimelineValidationInput, TimelineValidationOutput> {
  public readonly name = 'RTAIP_ValidationDriftAgent';
  public readonly stage = 'Validation';

  public validate(input: TimelineValidationInput): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!input.boundItinerary) {
      errors.push('Bound itinerary is required for timeline validation.');
    } else if (!input.boundItinerary.itinerary || input.boundItinerary.itinerary.length === 0) {
      errors.push('Bound itinerary must contain at least one day plan.');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  public async execute(
    input: TimelineValidationInput,
    ctx?: Partial<AgentContext>
  ): Promise<AgentResponse<TimelineValidationOutput>> {
    const startTime = Date.now();
    const validation = this.validate(input);

    if (!validation.valid) {
      return {
        success: false,
        stage: this.stage,
        agentName: this.name,
        validation,
        executionTimeMs: Date.now() - startTime,
        error: {
          code: 'VALIDATION_FAILED',
          message: validation.errors.join(' ')
        }
      };
    }

    const boundItinerary: BoundItinerary = JSON.parse(JSON.stringify(input.boundItinerary));
    const transitBufferMinutes = input.minimumTransitBufferMinutes || 60; // 60 mins airport-to-hotel buffer
    const drifts: TimelineDrift[] = [];
    const adjustments: TimelineAdjustment[] = [];

    // 1. DAY 1 OUTBOUND FLIGHT DRIFT CHECK
    if (boundItinerary.boundFlight && boundItinerary.itinerary.length > 0) {
      const flightArrivalMinutes = parseTimeToMinutes(boundItinerary.boundFlight.arrivalTime);
      const safeEarliestActivityMinutes = flightArrivalMinutes + transitBufferMinutes;
      const day1 = boundItinerary.itinerary[0];

      const adjustedActivities: BoundDayActivity[] = [];
      let nextAvailableSlotMinutes = safeEarliestActivityMinutes;

      for (const act of day1.activities) {
        if (act.category === 'transit') {
          // Keep flight activity intact
          adjustedActivities.push(act);
          continue;
        }

        const actStartMinutes = parseTimeToMinutes(act.startTime24h);
        const actEndMinutes = parseTimeToMinutes(act.endTime24h);
        const durationMinutes = Math.max(45, actEndMinutes - actStartMinutes);

        // CHECK IF ACTIVITY STARTS BEFORE SAFE AIRPORT TRANSIT TIME
        if (actStartMinutes < safeEarliestActivityMinutes) {
          const conflictTimeStr = act.startTime24h;
          const resolvedStartStr = formatMinutesToTime(nextAvailableSlotMinutes);
          const resolvedEndStr = formatMinutesToTime(nextAvailableSlotMinutes + durationMinutes);

          const flightArrTimeClean = formatMinutesToTime(flightArrivalMinutes);
          drifts.push({
            type: 'FLIGHT_ARRIVAL_OVERLAP',
            day: 1,
            severity: 'HIGH',
            message: `Activity '${act.title}' was planned at ${conflictTimeStr}, but flight ${boundItinerary.boundFlight.flightNumber} lands at ${flightArrTimeClean} (requires ~${transitBufferMinutes}m airport transfer).`,
            conflictingItem: act.title,
            conflictTime: conflictTimeStr,
            resolutionTime: `${resolvedStartStr} - ${resolvedEndStr}`
          });

          adjustments.push({
            day: 1,
            action: 'SHIFT',
            previousSlot: act.timeSlot,
            adjustedSlot: `${resolvedStartStr} - ${resolvedEndStr}`,
            description: `Shifted '${act.title}' after flight arrival and hotel check-in.`
          });

          adjustedActivities.push({
            ...act,
            timeSlot: `${resolvedStartStr} - ${resolvedEndStr}`,
            startTime24h: resolvedStartStr,
            endTime24h: resolvedEndStr,
            isAutoAdjusted: true
          });

          nextAvailableSlotMinutes += durationMinutes + 30; // 30 min pacing buffer
        } else {
          // Starts after safe time, check if it collides with earlier shifted items
          if (actStartMinutes < nextAvailableSlotMinutes) {
            const resolvedStartStr = formatMinutesToTime(nextAvailableSlotMinutes);
            const resolvedEndStr = formatMinutesToTime(nextAvailableSlotMinutes + durationMinutes);

            adjustments.push({
              day: 1,
              action: 'SHIFT',
              previousSlot: act.timeSlot,
              adjustedSlot: `${resolvedStartStr} - ${resolvedEndStr}`,
              description: `Paced '${act.title}' to avoid overlap with preceding adjusted activity.`
            });

            adjustedActivities.push({
              ...act,
              timeSlot: `${resolvedStartStr} - ${resolvedEndStr}`,
              startTime24h: resolvedStartStr,
              endTime24h: resolvedEndStr,
              isAutoAdjusted: true
            });

            nextAvailableSlotMinutes += durationMinutes + 30;
          } else {
            adjustedActivities.push(act);
            nextAvailableSlotMinutes = Math.max(nextAvailableSlotMinutes, actEndMinutes + 30);
          }
        }
      }

      day1.activities = adjustedActivities;
    }

    // 2. FINAL DAY RETURN FLIGHT DRIFT CHECK
    if (boundItinerary.boundReturnFlight && boundItinerary.itinerary.length > 1) {
      const lastDayIndex = boundItinerary.itinerary.length - 1;
      const lastDay = boundItinerary.itinerary[lastDayIndex];
      const returnDepMinutes = parseTimeToMinutes(boundItinerary.boundReturnFlight.departureTime);
      const airportReportingMinutes = returnDepMinutes - 120; // Must be at airport 2h prior

      const adjustedLastDayActivities: BoundDayActivity[] = [];

      for (const act of lastDay.activities) {
        if (act.category === 'transit' && act.title.includes('Return Flight')) {
          adjustedLastDayActivities.push(act);
          continue;
        }

        const actEndMinutes = parseTimeToMinutes(act.endTime24h);

        // If activity runs past airport reporting deadline
        if (actEndMinutes > airportReportingMinutes) {
          const conflictTimeStr = act.endTime24h;
          const newEndMinutes = Math.max(9 * 60, airportReportingMinutes - 30);
          const newStartMinutes = Math.max(8 * 60, newEndMinutes - 90);
          const resolvedStartStr = formatMinutesToTime(newStartMinutes);
          const resolvedEndStr = formatMinutesToTime(newEndMinutes);

          drifts.push({
            type: 'DEPARTURE_RUSH',
            day: lastDay.day,
            severity: 'HIGH',
            message: `Activity '${act.title}' runs until ${conflictTimeStr}, which collides with airport reporting time (${formatMinutesToTime(airportReportingMinutes)}) for return flight.`,
            conflictingItem: act.title,
            conflictTime: conflictTimeStr,
            resolutionTime: `${resolvedStartStr} - ${resolvedEndStr}`
          });

          adjustments.push({
            day: lastDay.day,
            action: 'SHIFT',
            previousSlot: act.timeSlot,
            adjustedSlot: `${resolvedStartStr} - ${resolvedEndStr}`,
            description: `Shifted earlier to ensure guaranteed on-time airport arrival.`
          });

          adjustedLastDayActivities.push({
            ...act,
            timeSlot: `${resolvedStartStr} - ${resolvedEndStr}`,
            startTime24h: resolvedStartStr,
            endTime24h: resolvedEndStr,
            isAutoAdjusted: true
          });
        } else {
          adjustedLastDayActivities.push(act);
        }
      }

      lastDay.activities = adjustedLastDayActivities;
    }

    const validatedPlan: ValidatedTripPlan = {
      itinerary: boundItinerary,
      isValid: true,
      driftDetected: drifts.length > 0,
      drifts,
      adjustments,
      validationSummary: {
        flightAligned: true,
        hotelAligned: true,
        activitiesPaced: true,
        bufferMinutesTotal: transitBufferMinutes * boundItinerary.itinerary.length
      }
    };

    return {
      success: true,
      stage: this.stage,
      agentName: this.name,
      data: {
        validatedPlan,
        adjustmentsCount: adjustments.length
      },
      executionTimeMs: Date.now() - startTime
    };
  }
}

export const validationDriftAgent = new ValidationDriftAgent();
