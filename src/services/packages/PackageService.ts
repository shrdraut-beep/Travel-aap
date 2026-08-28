import { BaseService } from '../BaseService';
export class PackageService extends BaseService {
  private collection = 'packages';
  async getAll() { return this.listDocuments(this.collection); }
}
export const packageService = new PackageService();
