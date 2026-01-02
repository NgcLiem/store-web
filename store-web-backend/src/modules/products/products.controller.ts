import {
  Controller,
  Get,
  Param,
  Query,
  ParseIntPipe,
  Post,
  Body,
  Put,
  Delete,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly service: ProductsService) {}

  // GET /products?q=abc
  @Get()
  async getAll(@Query('q') q?: string) {
    return this.service.findAll(q);
  }

  // GET /products/autocomplete?query=...
  @Get('autocomplete')
  autocomplete(@Query('query') query: string) {
    return this.service.autocomplete(query);
  }

  // GET /products/search?query=...&page=1&limit=12&sort=newest|price_asc|price_desc
  @Get('search')
  search(
    @Query('query') query: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sort') sort?: 'newest' | 'price_asc' | 'price_desc',
  ) {
    return this.service.search({
      query,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 12,
      sort,
    });
  }

  // GET /products/:id
  @Get(':id')
  async getOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  // POST /products
  @Post()
  async create(@Body() body: CreateProductDto) {
    return this.service.create(body);
  }

  // PUT /products/:id
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateProductDto,
  ) {
    return this.service.update(id, body);
  }

  // DELETE /products/:id
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
