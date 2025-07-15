import { Module, forwardRef } from '@nestjs/common';
import { RoomController } from './room.controller';
import { RoomService } from './room.service';
import { LobbyService } from './lobby.service';

@Module({
  controllers: [RoomController],
  providers: [RoomService, LobbyService],
  exports: [RoomService, LobbyService],
})
export class RoomModule { }
