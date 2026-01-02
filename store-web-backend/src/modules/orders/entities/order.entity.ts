export class OrderEntity {
  id: number;
  userId: number;
  status: string;
  total: number;
  paymentMethod?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
