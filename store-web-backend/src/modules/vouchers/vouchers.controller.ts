import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { VouchersService } from './vouchers.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller()
export class VouchersController {
    constructor(private readonly service: VouchersService) { }

    @Get('me/vouchers')
    getMyVouchers(@Req() req: any) {
        return this.service.getMyVouchers(req.user.id);
    }

    @Post('me/vouchers/apply')
    applyVoucher(
        @Req() req: any,
        @Body() body: { code: string; total: number },
    ) {
        return this.service.validateForUser(req.user.id, body.code, body.total);
    }
}
