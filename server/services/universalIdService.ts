/**
 * Universal ID Generator for RouTripO Multi-Vertical Inventory & Bookings
 * Formats:
 * - HOTEL : HTL-[State]-[City]-[RandomNum] (e.g. HTL-MAH-MUM-4821)
 * - FLIGHT: FLT-[Airline/Origin]-[No/Dest] (e.g. FLT-6E-204 or FLT-BOM-DEL)
 * - TRAIN : TRN-[No/Station] (e.g. TRN-12009 or TRN-CSMT)
 * - CAR   : CAR-[Origin]-[Destination]-[RandomNum] (e.g. CAR-MUM-PUN-7812)
 */
export class UniversalIdGenerator {
  static generateId(
    vertical: 'HOTEL' | 'FLIGHT' | 'TRAIN' | 'CAR',
    param1: string,
    param2?: string
  ): string {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const p1 = (param1 || 'GEN').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    const p2 = (param2 || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');

    switch (vertical) {
      case 'HOTEL':
        return `HTL-${p1.slice(0, 3)}-${(p2 || 'GEN').slice(0, 3)}-${randomNum}`;
      case 'FLIGHT':
        return p2 ? `FLT-${p1}-${p2}` : `FLT-${p1}-${randomNum}`;
      case 'TRAIN':
        return `TRN-${p1}`;
      case 'CAR':
        return `CAR-${p1.slice(0, 3)}-${(p2 || 'LOC').slice(0, 3)}-${randomNum}`;
      default:
        return `GEN-${randomNum}`;
    }
  }

  /**
   * Generates standard booking confirmation identifiers (e.g., CONF-12345)
   */
  static generateConfirmationId(prefix: string = 'CONF'): string {
    const randNum = Math.floor(10000 + Math.random() * 90000);
    return `${prefix.toUpperCase()}-${randNum}`;
  }
}
