import { Module } from '@nestjs/common';
import { VouchersService } from './vouchers.service';
import { VouchersController } from './vouchers.controller';
import { DatabaseModule } from '../../database/database.module';

@Module({
    imports: [DatabaseModule],
    providers: [VouchersService],
    controllers: [VouchersController],
    exports: [VouchersService],
})
export class VouchersModule { }
