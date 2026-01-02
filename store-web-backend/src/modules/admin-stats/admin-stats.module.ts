import { Module } from '@nestjs/common';
import { AdminStatsController } from './admin-stats.controller';
import { AdminStatsService } from './admin-stats.service';
import { DatabaseService } from '../../database/services/database.service';

@Module({
    controllers: [AdminStatsController],
    providers: [AdminStatsService, DatabaseService],
})
export class AdminStatsModule {}
