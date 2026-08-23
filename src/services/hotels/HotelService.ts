import { BaseService } from '../BaseService';
import { where } from 'firebase/firestore';

export class HotelService extends BaseService {
  private collection = 'hotels';

  async getHotel(id: string) {
    return this.getDocument(this.collection, id);
  }

  async getAllHotels() {
    return this.listDocuments(this.collection);
  }

  async getHotelsByUser(userId: string) {
    return this.listDocuments(this.collection, [where('userId', '==', userId)]);
  }

  async createHotel(data: any) {
    const id = crypto.randomUUID();
    await this.createDocument(this.collection, id, { ...data, createdAt: new Date() });
    return id;
  }
}

export const hotelService = new HotelService();
