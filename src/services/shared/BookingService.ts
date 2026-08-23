import { BaseService } from '../BaseService';

export class BookingService extends BaseService {
  private collection = 'bookings';

  async updateBookingStatus(id: string, status: string) {
    await this.updateDocument(this.collection, id, { status, updatedAt: new Date() });
  }

  async updateBookingWithRefundInfo(id: string, status: string, refundId: string, refundAmount: number) {
    await this.updateDocument(this.collection, id, { 
        status, 
        refundId, 
        refundAmount,
        updatedAt: new Date() 
    });
  }

  async getBooking(id: string) {
    return await this.getDocument(this.collection, id);
  }

  async createBooking(data: any) {
    const id = crypto.randomUUID();
    await this.createDocument(this.collection, id, { ...data, status: 'Pending', createdAt: new Date() });
    return id;
  }
}

export const bookingService = new BookingService();
