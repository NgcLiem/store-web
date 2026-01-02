import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PaymentMethodsService } from './payment-method.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';

@UseGuards(JwtAuthGuard)
@Controller('payments')
export class PaymentMethodsController {
  constructor(private readonly service: PaymentMethodsService) {}

  @Get()
  getMyMethods(@Req() req: any) {
    return this.service.findAllByUser(req.user.id);
  }

  @Post()
  create(@Req() req: any, @Body() body: CreatePaymentMethodDto) {
    return this.service.create(req.user.id, body);
  }

  @Patch(':id/default')
  setDefault(@Req() req: any, @Param('id') id: string) {
    return this.service.setDefault(req.user.id, Number(id));
  }

  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.service.remove(req.user.id, Number(id));
  }
}
