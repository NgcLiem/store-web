export class CheckoutItemDto {
    product_id: number;
    quantity: number;
    size?: string;
}

export class CheckoutDto {
    items: CheckoutItemDto[];
    address_id: number;
    payment_method_id: number;
    voucher_id?: number;
}
