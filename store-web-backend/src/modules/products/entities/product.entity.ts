export class ProductEntity {
  id: number;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  stock?: number;
  createdAt?: Date;
  updatedAt?: Date;
}
