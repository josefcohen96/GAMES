import { Module } from '@nestjs/common';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { WarService } from './war/war.service';
import { EratzIrService } from './eratzIr/eratzIr.service';
import { EnglishService } from './english/english.service';
import { RoomModule } from '../room/room.module';
import { GameGateway } from './game.gateway';
import { JwtModule } from '@nestjs/jwt';
import { AiValidationModule } from '../ai-validation/ai-validation.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
@Module({
  imports: [
    AiValidationModule,
    RoomModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET', 'secretKey'),
        signOptions: { expiresIn: config.get<string>('JWT_EXPIRES_IN', '1h') },
      }),
    }),
  ],
  controllers: [GameController],
  providers: [GameService, WarService, EratzIrService, EnglishService, GameGateway],
  exports: [GameService],
})
export class GameModule {}
