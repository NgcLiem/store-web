export class CreateProductDto {
  name!: string;
  price!: number;
  description?: string;
  imageUrl?: string;
  categoryId?: number;
  stock?: number;
  brand?: string;
  // thêm field nếu DB của bạn có
  [key: string]: any;
}
