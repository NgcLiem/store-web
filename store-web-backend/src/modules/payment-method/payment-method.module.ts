import { Module } from '@nestjs/common';
import { PaymentMethodsService } from './payment-method.service';
import { PaymentMethodsController } from './payment-method.controller';
import { DatabaseModule } from '../../database/database.module';

@Module({
    imports: [DatabaseModule],
    providers: [PaymentMethodsService],
    controllers: [PaymentMethodsController],
})
export class PaymentMethodsModule { }
