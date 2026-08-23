import { BaseService } from '../BaseService';
import { where } from 'firebase/firestore';

export class FlightService extends BaseService {
  private collection = 'flights';

  async getFlight(id: string) {
    return this.getDocument(this.collection, id);
  }

  async getAllFlights() {
    return this.listDocuments(this.collection);
  }

  async getFlightsByUser(userId: string) {
    return this.listDocuments(this.collection, [where('userId', '==', userId)]);
  }

  async createFlight(data: any) {
    const id = crypto.randomUUID();
    await this.createDocument(this.collection, id, { ...data, createdAt: new Date() });
    return id;
  }
}

export const flightService = new FlightService();
