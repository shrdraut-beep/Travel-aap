import { BaseService } from '../BaseService';
export class CabService extends BaseService {
  private collection = 'cabs';
  async getAll() { return this.listDocuments(this.collection); }
}
export const cabService = new CabService();
