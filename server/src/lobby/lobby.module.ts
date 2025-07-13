import { Module, forwardRef } from '@nestjs/common';
import { LobbyController } from './lobby.controller';
import { LobbyService } from './lobby.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Room } from '../room/entities/room.entity';
import { RoomModule } from '../room/room.module';

@Module({
  imports: [
    forwardRef(() => RoomModule), // Use forwardRef to avoid circular dependency issues
    TypeOrmModule.forFeature([Room])],
  controllers: [LobbyController],
  providers: [LobbyService],
  exports: [LobbyService],

})
export class LobbyModule { }
