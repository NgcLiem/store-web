export class CreateAddressDto {
  /** Họ tên người nhận */
  fullName!: string;
  /** SĐT người nhận */
  phone!: string;
  /** Địa chỉ chi tiết */
  addressLine!: string;
  /** Đặt làm mặc định (tùy chọn) */
  isDefault?: boolean;
}
