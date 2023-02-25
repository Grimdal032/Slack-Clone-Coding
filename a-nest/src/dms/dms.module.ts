import { Module } from '@nestjs/common';
import { DMsService } from './dms.service';
import { DmsController } from './dms.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from 'src/entities/Users';
import { Workspaces } from 'src/entities/Workspaces';
import { EventsModule } from 'src/events/events.module';
import { DMs } from 'src/entities/DMs';

@Module({
  imports: [TypeOrmModule.forFeature([DMs, Users, Workspaces]), EventsModule],
  providers: [DMsService],
  controllers: [DmsController],
})
export class DMsModule {}
