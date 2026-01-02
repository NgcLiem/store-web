import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { DatabaseModule } from '../../database/database.module';
import { AdminProductsController } from './admin-products.controller';
import { StaffProductsController } from './staff-products.controller';
import { ProductsController } from './products.controller';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [DatabaseModule, CloudinaryModule],
  controllers: [
    AdminProductsController,
    StaffProductsController,
    ProductsController,
  ],
  providers: [ProductsService],
})
export class ProductsModule { }
