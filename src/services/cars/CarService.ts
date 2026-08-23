import { BaseService } from '../BaseService';
export class CarService extends BaseService {
  private collection = 'cars';
  async getAll() { return this.listDocuments(this.collection); }
}
export const carService = new CarService();
