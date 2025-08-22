import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bull';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { CollectorModule } from './collector/collector.module';
import { StorageModule } from './storage/storage.module';
import { MonitoringModule } from './monitoring/monitoring.module';

@Module({
  imports: [
    ConfigModule,
    ScheduleModule.forRoot(),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
    }),
    DatabaseModule,
    CollectorModule,
    StorageModule,
    MonitoringModule,
  ],
})
export class AppModule {}