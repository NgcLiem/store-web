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
import { AddressesService } from './addresses.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@UseGuards(JwtAuthGuard)
@Controller('addresses')
export class AddressesController {
    constructor(private readonly service: AddressesService) {}

    @Get()
    getMyAddresses(@Req() req: any) {
        return this.service.findAllByUser(req.user.id);
    }

    @Post()
    create(@Req() req: any, @Body() body: CreateAddressDto) {
        return this.service.create(req.user.id, body);
    }

    @Patch(':id')
    update(
        @Req() req: any,
        @Param('id') id: string,
        @Body() body: UpdateAddressDto,
    ) {
        return this.service.update(req.user.id, Number(id), body);
    }

    @Patch(':id/default')
    setDefault(@Req() req: any, @Param('id') id: string) {
        return this.service.setDefault(req.user.id, Number(id));
    }

    @Delete(':id')
    delete(@Req() req: any, @Param('id') id: string) {
        return this.service.remove(req.user.id, Number(id));
    }
}
