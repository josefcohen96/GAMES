import { Module, forwardRef } from '@nestjs/common';
import { RoomController } from './room.controller';
import { RoomService } from './room.service';
import { LobbyModule } from 'src/lobby/lobby.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    forwardRef(() => LobbyModule),  // to avoid circular dependency issues
    forwardRef(() => UsersModule),],
  controllers: [RoomController],
  providers: [RoomService],
  exports: [RoomService],
})
export class RoomModule { }
