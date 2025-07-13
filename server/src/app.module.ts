import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/entities/user.entity'; 
import { LobbyModule } from './lobby/lobby.module';
import { Room } from './room/entities/room.entity';
import { RoomModule } from './room/room.module';
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres', // שנה בהתאם
      password: '1234', // שנה בהתאם
      database: 'games_db',
      entities: [User, Room],
      synchronize: true, // אל תשאיר ב-true בפרודקשן
    }),
    UsersModule, AuthModule, LobbyModule, RoomModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
