import {
    Controller,
    Get,
    Query,
    Param,
    ParseIntPipe,
    Post,
    Body,
    Put,
    Delete,
} from '@nestjs/common';
import { StaffService } from './staff.service';

@Controller('staff')
export class StaffController {
    constructor(private readonly service: StaffService) { }

    // GET /staff?q=abc
    @Get()
    getAll(@Query('q') q?: string) {
        return this.service.findAll(q);
    }

    // GET /staff/:id
    @Get(':id')
    getOne(@Param('id', ParseIntPipe) id: number) {
        return this.service.findOne(id);
    }

    // POST /staff
    @Post()
    create(@Body() body: any) {
        return this.service.create(body);
    }

    // PUT /staff/:id
    @Put(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
        return this.service.update(id, body);
    }

    // DELETE /staff/:id
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.service.remove(id);
    }
}
