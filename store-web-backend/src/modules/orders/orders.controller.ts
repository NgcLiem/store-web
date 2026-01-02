import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CheckoutDto } from './dto/checkout.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly service: OrdersService) { }

  @UseGuards(JwtAuthGuard)
  @Post('checkout')
  checkout(@Req() req: any, @Body() body: CheckoutDto) {
    return this.service.checkout(req.user.id, body);
  }

  @UseGuards(JwtAuthGuard)
  @UseGuards(JwtAuthGuard)
  @Get()
  getAll(
    @Query('user_id') userId?: string,
    @Query('status') status?: string,
    @Query('q') q?: string,
    @Req() req?: any,
  ) {
    // Nếu user không phải admin, chỉ lấy đơn hàng của chính họ
    const user_id = req?.user?.role === 'admin' ? (userId ? Number(userId) : undefined) : req?.user?.id;
    console.log('[GET /orders] user_id:', user_id, 'req.user:', req?.user, 'query.user_id:', userId);
    const safeStatus = status === 'all' ? undefined : status;
    return this.service.findAll({ user_id, status: safeStatus, q });
  }

  @Get(':id')
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOneWithItems(id);
  }

  @Post()
  create(@Body() body: any) {
    return this.service.create(body);
  }

  @UseGuards(JwtAuthGuard)
  @Post(":id/cancel")
  async cancel(@Param("id") id: string, @Req() req: any) {
    const orderId = Number(id);
    return this.service.cancelOrder(orderId, Number(req.user.id));
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
