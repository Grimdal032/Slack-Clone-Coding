import { Module } from '@nestjs/common';
import { ChannelsService } from './channels.service';
import { ChannelsController } from './channels.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChannelMembers } from 'src/entities/ChannelMembers';
import { Channels } from 'src/entities/Channels';
import { Users } from 'src/entities/Users';
import { WorkspaceMembers } from 'src/entities/WorkspaceMembers';
import { Workspaces } from 'src/entities/Workspaces';
import { ChannelChats } from 'src/entities/ChannelChats';
import { EventsModule } from 'src/events/events.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Users,
      Channels,
      ChannelMembers,
      ChannelChats,
      Workspaces,
      WorkspaceMembers,
      EventsModule,
    ]),
  ],
  providers: [ChannelsService],
  controllers: [ChannelsController],
})
export class ChannelsModule {}
