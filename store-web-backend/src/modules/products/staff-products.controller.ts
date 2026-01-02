import { Body, Controller, Get, Param, ParseIntPipe, Put, Query, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('staff')
@Controller('staff/products')
export class StaffProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll(@Query('q') q?: string, @Query('category') category?: string) {
    return this.productsService.findAll(q, category);
  }

  @Put(':id/stock')
  updateStock(
    @Param('id', ParseIntPipe) id: number,
    @Body('stock') stock: number,
  ) {
    return this.productsService.updateStock(id, Number(stock));
  }
}
