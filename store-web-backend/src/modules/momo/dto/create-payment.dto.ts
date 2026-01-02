export class CreateMomoPaymentDto {
    amount: number;          // 50000
    orderInfo: string;       // "pay with MoMo"
    extraData?: string;      // "" (base64 nếu cần)
    requestType?: string;    // default: "payWithMethod"
    autoCapture?: boolean;   // default: true
    lang?: 'vi' | 'en';      // default: 'vi'
    orderGroupId?: string;   // default: ""
}
