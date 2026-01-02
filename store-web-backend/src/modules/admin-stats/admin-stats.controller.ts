// src/modules/admin-stats/admin-stats.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { AdminStatsService } from './admin-stats.service';

@Controller('admin-stats')
export class AdminStatsController {
    constructor(private readonly service: AdminStatsService) {}

    @Get('dashboard')
    dashboard(
        @Query('days') days?: string,
        @Query('months') months?: string,
        @Query('years') years?: string,
    ) {
        return this.service.dashboard({ days, months, years });
    }
}
