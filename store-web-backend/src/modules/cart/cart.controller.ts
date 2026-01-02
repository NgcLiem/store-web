import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Controller('cart')
export class CartController {
  constructor(private readonly service: CartService) { }

  @UseGuards(JwtAuthGuard)
  @Get()
  getMyCart(@Req() req: any) {
    return this.service.getUserCart(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('items')
  addItem(@Req() req: any, @Body() body: AddToCartDto) {
    return this.service.addItem(req.user.id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('items/:id')
  updateItem(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateCartItemDto,
  ) {
    return this.service.updateItem(req.user.id, id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('items/:id')
  removeItem(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.service.removeItem(req.user.id, id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('clear')
  clearMyCart(@Req() req: any) {
    return this.service.clearUserCart(req.user.id);
  }
}
