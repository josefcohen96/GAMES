import { Module } from '@nestjs/common';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { WarService } from './war/war.service';
@Module({
  controllers: [GameController],
  providers: [GameService, WarService],
  exports: [GameService, WarService],
})
export class GameModule { }
