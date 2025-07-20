import { Module } from '@nestjs/common';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { WarService } from './war/war.service';
import { EratzIrService } from './eratzIr/eratzIr.service';
import { RoomModule } from '../room/room.module';
import { GameGateway } from './game.gateway';
import { JwtModule } from '@nestjs/jwt';
import { AiValidationModule } from '../ai-validation/ai-validation.module';
@Module({
  imports: [
    AiValidationModule,
    RoomModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secretKey', 
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [GameController],
  providers: [GameService, WarService, EratzIrService, GameGateway],
  exports: [GameService],
})
export class GameModule {}
