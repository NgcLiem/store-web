export class CreateVoucherDto {
  code!: string;
  discountType!: 'percent' | 'amount';
  discountValue!: number;
  minOrderValue?: number;
  maxDiscount?: number;
  startAt?: string; // ISO date
  endAt?: string;   // ISO date
  isActive?: boolean;
  [key: string]: any;
}
