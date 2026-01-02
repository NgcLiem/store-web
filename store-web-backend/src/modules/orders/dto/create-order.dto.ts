export class CreateOrderDto {
  userId!: number;
  items!: Array<{ productId: number; quantity: number; price?: number }>;
  addressId?: number;
  paymentMethod?: string;
  voucherCode?: string;
  note?: string;
  [key: string]: any;
}
