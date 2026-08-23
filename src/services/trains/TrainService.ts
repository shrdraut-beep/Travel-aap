import { BaseService } from '../BaseService';
import { where } from 'firebase/firestore';

export class TrainService extends BaseService {
  private collection = 'trains';

  async getTrain(id: string) {
    return this.getDocument(this.collection, id);
  }

  async getAllTrains() {
    return this.listDocuments(this.collection);
  }

  async getTrainsByUser(userId: string) {
    return this.listDocuments(this.collection, [where('userId', '==', userId)]);
  }

  async createTrain(data: any) {
    const id = crypto.randomUUID();
    await this.createDocument(this.collection, id, { ...data, createdAt: new Date() });
    return id;
  }
}

export const trainService = new TrainService();
