export class VoucherEntity {
  id: number;
  code: string;
  discountType: 'PERCENT' | 'FIXED';
  discountValue: number;
  minOrderValue?: number;
  expiresAt?: Date;
  isActive: boolean;
}
