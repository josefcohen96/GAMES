import { Module } from '@nestjs/common';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { WarService } from './war/war.service';
import { EratzIrService } from './eratzIr/eratzIr.service'; // Importing EratzIrService
@Module({
  controllers: [GameController],
  providers: [GameService, WarService, EratzIrService],
  exports: [GameService, WarService, EratzIrService],
})
export class GameModule { }
