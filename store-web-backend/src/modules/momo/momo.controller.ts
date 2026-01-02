import {
    Body,
    Controller,
    Post,
    Res,
    BadRequestException,
    HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express'; //  Thêm 'type' để tránh lỗi biên dịch
import { OrdersService } from '../orders/orders.service';
import { MomoService } from './momo.service';

@Controller('momo')
export class MomoController {
    constructor(
        private readonly orders: OrdersService,
        private readonly momo: MomoService,
    ) {}

    @Post('create-payment')
    async createPayment(@Body() body: any) {
        const internalOrderId = Number(body?.orderId);
        if (!internalOrderId) throw new BadRequestException('Thiếu orderId');

        const order = await this.orders.findOneWithItems(internalOrderId);
        if (!order) throw new BadRequestException('Order không tồn tại');

        // MoMo Sandbox công cộng giới hạn < 50tr, tốt nhất test < 1tr
        const amount = Math.round(Number(order.total_amount ?? 0));
        if (amount < 1000)
            throw new BadRequestException('Số tiền tối thiểu 1000 VND');

        // 1. Set status pending
        await this.orders.updatePaymentStatusByOrderId(internalOrderId, {
            status: 'pending',
            payment_method: 'momo',
        });

        // 2. Gọi Service tạo link
        // Lưu ý: Không cần truyền orderInfo dài dòng, Service tự lo
        return await this.momo.createPayment({
            internalOrderId,
            amount,
        });
    }

    @Post('ipn')
    async ipn(@Body() body: any, @Res() res: Response) {
        console.log('📩 IPN Received:', body);

        try {
            // 1. Validate Chữ ký
            const isValid = this.momo.verifyIpnSignature(body);
            if (!isValid) {
                console.error('❌ IPN Signature Invalid');
                return res.status(HttpStatus.NO_CONTENT).send();
            }

            // 2. Lấy internalOrderId từ extraData
            const meta = this.momo.decodeExtraData(body.extraData);
            const internalOrderId = Number(meta?.internalOrderId);

            if (!internalOrderId) {
                console.error(
                    '❌ Không tìm thấy internalOrderId trong extraData',
                );
                return res.status(HttpStatus.NO_CONTENT).send();
            }

            const resultCode = Number(body.resultCode);
            const transId = body.transId;
            const message = body.message;

            // 3. Cập nhật đơn hàng
            if (resultCode === 0) {
                // Thành công
                console.log(` Order #${internalOrderId} SUCCESS`);
                await this.orders.updatePaymentStatusByOrderId(
                    internalOrderId,
                    {
                        status: 'confirmed',
                        momo_trans_id: transId, // Service sẽ log ra console
                        momo_message: message,
                    },
                );
            } else {
                // Thất bại
                console.log(`⚠️ Order #${internalOrderId} FAILED: ${message}`);
                await this.orders.updatePaymentStatusByOrderId(
                    internalOrderId,
                    {
                        // status: 'cancelled', // Tùy chọn: có muốn hủy luôn đơn không?
                        momo_trans_id: transId,
                        momo_message: message,
                    },
                );
            }

            return res.status(HttpStatus.NO_CONTENT).send();
        } catch (err) {
            console.error('❌ IPN Error:', err);
            return res.status(HttpStatus.NO_CONTENT).send();
        }
    }
}
