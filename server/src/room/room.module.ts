import { Module, forwardRef } from '@nestjs/common';
import { RoomController } from './room.controller';
import { RoomService } from './room.service';
import { LobbyService } from './lobby.service';
import { UsersModule } from 'src/users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Room } from './entities/room.entity';

@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([Room]),
  ],
  controllers: [RoomController],
  providers: [RoomService, LobbyService],
  exports: [RoomService, LobbyService],
})
export class RoomModule { }
