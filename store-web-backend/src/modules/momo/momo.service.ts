import {
    Injectable,
    InternalServerErrorException,
    Logger,
} from '@nestjs/common';
import axios from 'axios';
import * as crypto from 'crypto';

type CreatePaymentParams = {
    internalOrderId: number;
    amount: number;
    orderInfo?: string; // Optional vì mình sẽ tự generate lại cho chuẩn
    extraData?: string;
};

@Injectable()
export class MomoService {
    private readonly logger = new Logger(MomoService.name);

    private get config() {
        return {
            // Dùng cấu hình mặc định nếu không có .env để tránh crash
            partnerCode: process.env.MOMO_PARTNER_CODE || 'MOMO',
            accessKey: process.env.MOMO_ACCESS_KEY || 'F8BBA842ECF85',
            secretKey:
                process.env.MOMO_SECRET_KEY ||
                'K951B6PE1waDMi640xX08PD3vg6EkVlz',
            endpoint:
                process.env.MOMO_ENDPOINT ||
                'https://test-payment.momo.vn/v2/gateway/api/create',
            redirectUrl: process.env.MOMO_REDIRECT_URL,
            ipnUrl: process.env.MOMO_IPN_URL,
        };
    }

    private sign(rawSignature: string) {
        return crypto
            .createHmac('sha256', this.config.secretKey)
            .update(rawSignature)
            .digest('hex');
    }

    async createPayment(params: CreatePaymentParams) {
        const { partnerCode, accessKey, endpoint, redirectUrl, ipnUrl } =
            this.config;

        if (!partnerCode || !accessKey || !redirectUrl || !ipnUrl) {
            throw new InternalServerErrorException(
                'Thiếu cấu hình MOMO trong .env',
            );
        }

        // 1. Tạo ID DUY NHẤT
        // Format: PartnerCode + Timestamp + Random 4 số
        const uniqueSuffix = Date.now() + Math.floor(Math.random() * 1000);
        const requestId = `${partnerCode}${uniqueSuffix}`;
        const momoOrderId = requestId; // MoMo khuyên requestId == orderId ở Sandbox

        // 2. Xử lý dữ liệu an toàn
        // const amountStr = Math.floor(params.amount).toString(); // Bắt buộc số nguyên
        // OrderInfo không dấu, không ký tự đặc biệt
        const amountStr = '10000';
        const orderInfo = `Thanh toan don hang ${params.internalOrderId}`;

        // 3. Encode internalOrderId vào extraData (Quan trọng để map đơn hàng khi IPN)
        const extraDataObj = { internalOrderId: params.internalOrderId };
        const extraData = Buffer.from(JSON.stringify(extraDataObj)).toString(
            'base64',
        );

        const requestType = 'captureWallet';
        const lang = 'vi';

        // 4. Tạo chữ ký (ĐÚNG THỨ TỰ ALPHABET)
        const rawSignature =
            `accessKey=${accessKey}` +
            `&amount=${amountStr}` +
            `&extraData=${extraData}` +
            `&ipnUrl=${ipnUrl}` +
            `&orderId=${momoOrderId}` +
            `&orderInfo=${orderInfo}` +
            `&partnerCode=${partnerCode}` +
            `&redirectUrl=${redirectUrl}` +
            `&requestId=${requestId}` +
            `&requestType=${requestType}`;

        const signature = this.sign(rawSignature);

        const requestBody = {
            partnerCode,
            partnerName: 'Test',
            storeId: 'MomoTestStore',
            accessKey,
            requestId,
            amount: amountStr,
            orderId: momoOrderId,
            orderInfo,
            redirectUrl,
            ipnUrl,
            extraData,
            requestType,
            lang,
            signature,
        };

        try {
            console.log(
                '📤 Sending to MoMo:',
                JSON.stringify(requestBody, null, 2),
            );

            const { data } = await axios.post(endpoint, requestBody, {
                headers: { 'Content-Type': 'application/json' },
                timeout: 15000,
            });

            if (!data || data.resultCode !== 0) {
                console.error('❌ MoMo Error Response:', data);
                throw new Error(data?.message || 'Lỗi tạo thanh toán MoMo');
            }

            return {
                payUrl: data.payUrl,
                qrCodeUrl: data.qrCodeUrl,
                momoOrderId, // Trả về để log nếu cần
            };
        } catch (err: any) {
            console.error(
                '❌ MoMo Exception:',
                err.response?.data || err.message,
            );
            throw new InternalServerErrorException(
                'Không thể kết nối tới MoMo',
            );
        }
    }

    verifyIpnSignature(body: any): boolean {
        const rawSignature =
            `accessKey=${this.config.accessKey}` +
            `&amount=${body.amount}` +
            `&extraData=${body.extraData}` + // Sandbox đôi khi trả về extraData rỗng nếu lúc gửi ko có, nhưng code trên ta luôn gửi có
            `&message=${body.message}` +
            `&orderId=${body.orderId}` +
            `&orderInfo=${body.orderInfo}` +
            `&orderType=${body.orderType}` +
            `&partnerCode=${body.partnerCode}` +
            `&payType=${body.payType}` +
            `&requestId=${body.requestId}` +
            `&responseTime=${body.responseTime}` +
            `&resultCode=${body.resultCode}` +
            `&transId=${body.transId}`;

        return this.sign(rawSignature) === body.signature;
    }

    decodeExtraData(extraData?: string) {
        try {
            if (!extraData) return null;
            const json = Buffer.from(extraData, 'base64').toString('utf8');
            return JSON.parse(json);
        } catch {
            return null;
        }
    }
}
