import {
    Controller,
    Get,
    Patch,
    Delete,
    Param,
    Body,
    Query,
    ParseIntPipe,
    UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

// Nếu bạn đã có RolesGuard / Roles decorator thì dùng đúng cái của bạn.
// Mình viết theo pattern phổ biến.
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin') // chỉ admin vào được
@Controller('admin/orders')
export class OrdersAdminController {
    constructor(private readonly ordersService: OrdersService) { }

    // GET /admin/orders?status=pending&q=...&page=1&pageSize=10
    @Get()
    async list(
        @Query('status') status?: string,
        @Query('q') q?: string,
        @Query('page') page?: string,
        @Query('pageSize') pageSize?: string,
    ) {
        const p = Math.max(1, Number(page || 1));
        const ps = Math.min(100, Math.max(1, Number(pageSize || 1000)));

        const all = await this.ordersService.findAll({
            status: status && status !== 'all' ? status : undefined,
            q: q?.trim() || undefined,
        });

        // (tuỳ chọn) phân trang phía backend
        const start = (p - 1) * ps;
        const items = all.slice(start, start + ps);

        return {
            success: true,
            items,
            total: all.length,
            page: p,
            pageSize: ps,
        };
    }

    // PATCH /admin/orders/:id/status
    @Patch(':id/status')
    async updateStatus(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: { status: string },
    ) {
        await this.ordersService.update(id, { status: body.status as any });
        // Return updated order with items
        return await this.ordersService.findOneWithItems(id);
    }

    // DELETE /admin/orders/:id
    @Delete(':id')
    async remove(@Param('id', ParseIntPipe) id: number) {
        await this.ordersService.remove(id);
        return { success: true };
    }
}
