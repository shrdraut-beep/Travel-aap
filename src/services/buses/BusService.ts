import { BaseService } from '../BaseService';
export class BusService extends BaseService {
  private collection = 'buses';
  async getAll() { return this.listDocuments(this.collection); }
}
export const busService = new BusService();
