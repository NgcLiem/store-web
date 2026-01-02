import { Module } from '@nestjs/common';
import { MomoController } from './momo.controller';
import { MomoService } from './momo.service';
import { OrdersModule } from '../orders/orders.module';
import { HttpModule } from '@nestjs/axios';

@Module({
    imports: [OrdersModule, HttpModule],
    controllers: [MomoController],
    providers: [MomoService],
    exports: [MomoService],
})
export class MomoModule {}
