import { ShipmentRepository } from "../repositories/shipment.repository";

const repo = new ShipmentRepository();

export class ShipmentService {
  async getAll() {
    return repo.findAll();
  }
  async getById(id: number) {
    return repo.findById(id);
  }
  async create(data: any) {
    return repo.create(data);
  }
}
