import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from './users/entities/user.entity';
import { Room } from './room/entities/room.entity';
import { RoomModule } from './room/room.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/jwt-auth.guard'; // הוסף את ה-Guard
import { GameModule } from './game/game.module';
import { AiValidationModule } from './ai-validation/ai-validation.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '1234',
      database: 'games_db', // for laptop use 'games-db'
      entities: [Users, Room],
      synchronize: true,
    }),
     ConfigModule.forRoot({
      isGlobal: true, // Makes env vars available everywhere
    }),
    UsersModule,
    AuthModule,
    RoomModule,
    GameModule,
    AiValidationModule,

  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
