import {
    Controller,
    Get,
    Param,
    Query,
    Put,
    Patch,
    Delete,
    Body,
    UseGuards,
    ParseIntPipe,
    BadRequestException,
} from '@nestjs/common';
import { OrdersService } from './orders.service';

// Nếu bạn có guard JWT + role thì bật lên
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import { RolesGuard } from '../auth/guards/roles.guard';
// import { Roles } from '../auth/decorators/roles.decorator';

@Controller('staff/orders')
// @UseGuards(JwtAuthGuard, RolesGuard)
// @Roles('staff', 'admin')
export class StaffOrdersController {
    constructor(private readonly ordersService: OrdersService) {}

    //  LIST: GET /staff/orders?status=&q=
    // FIX lỗi 400: KHÔNG ParseIntPipe cho query rỗng
    @Get()
    async list(@Query('status') status?: string, @Query('q') q?: string) {
        // staff xem tất cả đơn (hoặc bạn có thể lọc theo quyền)
        return this.ordersService.findAll({ status, q });
    }

    //  DETAIL: GET /staff/orders/:id
    @Get(':id')
    async detail(@Param('id', ParseIntPipe) id: number) {
        return this.ordersService.findOneWithItems(id);
    }

    //  UPDATE (FE bạn đang gọi PUT /staff/orders/:id)
    // Body: { status: "shipped" } hoặc các field khác bạn cho phép
    @Put(':id')
    async update(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
        // Nếu bạn chỉ muốn staff cập nhật status thôi:
        if (!body || !body.status) {
            throw new BadRequestException('Thiếu status');
        }
        return this.ordersService.update(id, { status: body.status });
    }

    // (Tuỳ chọn) endpoint update status riêng: PATCH /staff/orders/:id/status
    @Patch(':id/status')
    async updateStatus(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: { status: string },
    ) {
        if (!body?.status) throw new BadRequestException('Thiếu status');
        await this.ordersService.update(id, { status: body.status as any });
        // Return updated order with items
        return await this.ordersService.findOneWithItems(id);
    }

    //  DELETE: /staff/orders/:id (nếu bạn cho staff xoá)
    @Delete(':id')
    async remove(@Param('id', ParseIntPipe) id: number) {
        return this.ordersService.remove(id);
    }
}
