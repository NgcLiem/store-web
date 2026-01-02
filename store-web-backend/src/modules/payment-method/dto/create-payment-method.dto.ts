export class CreatePaymentMethodDto {
  name!: string; // vd: COD, MoMo, Bank
  description?: string;
  isActive?: boolean;
}
