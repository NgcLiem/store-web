import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { DatabaseModule } from '../../database/database.module';
import { VouchersModule } from '../vouchers/vouchers.module';
import { OrdersAdminController } from './order.admin.controller';
import { StaffOrdersController } from './order.staff.controller';

@Module({
  imports: [DatabaseModule, VouchersModule],
  controllers: [OrdersController, OrdersAdminController, StaffOrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule { }
