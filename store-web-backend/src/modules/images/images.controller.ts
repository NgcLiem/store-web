import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ImagesService } from './images.service';

@Controller('images')
export class ImagesController {
    constructor(private imagesService: ImagesService) {}

    @Get()
    async findAll() {
        const images = await this.imagesService.findAll();
        return { success: true, data: images };
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        const image = await this.imagesService.findOne(id);
        return { success: !!image, data: image };
    }
}
