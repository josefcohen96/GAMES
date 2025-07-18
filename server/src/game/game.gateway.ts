import {
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameService } from './game.service';
import { RoomService } from '../room/room.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';

@WebSocketGateway({
  cors: { origin: '*' },
})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(
    private readonly gameService: GameService,
    private readonly roomService: RoomService,
    private readonly jwtService: JwtService
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token;
      if (!token) throw new UnauthorizedException('No token provided');

      const decoded = this.jwtService.verify(token);
      (client as any).user = decoded;
      console.log(`✅ Client connected: ${decoded.username}`);
    } catch (error) {
      console.log('❌ Unauthorized socket connection');
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`❌ Client disconnected: ${(client as any).user?.username}`);
  }

  /** הצטרפות לחדר */
  @SubscribeMessage('joinRoom')
  handleJoinRoom(@ConnectedSocket() client: Socket, @MessageBody() data: { roomId: string }) {
    const { roomId } = data;
    const userId = (client as any).user.sub;

    client.join(roomId);
    const result = this.roomService.joinRoom(roomId, userId);

    this.server.to(roomId).emit('roomUpdate', {
      message: `${userId} הצטרף לחדר`,
      players: result.players,
    });

    // שולח גם מצב נוכחי של המשחק
    const state = this.gameService.handleAction(roomId, { gameType: 'eratz-ir', action: 'state' });
    this.server.to(roomId).emit('gameStateUpdate', state);
  }

  /** עזיבת חדר */
  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(@ConnectedSocket() client: Socket, @MessageBody() data: { roomId: string }) {
    const { roomId } = data;
    const userId = (client as any).user.sub;

    client.leave(roomId);
    const result = this.roomService.leaveRoom(roomId, userId);

    this.server.to(roomId).emit('roomUpdate', {
      message: `${userId} עזב את החדר`,
      players: result.players,
    });
  }

  /** התחלת משחק חדש */
  @SubscribeMessage('resetGame')
  handleResetGame(@MessageBody() data: { roomId: string }) {
    const { roomId } = data;
    const result = this.gameService.handleAction(roomId, { gameType: 'eratz-ir', action: 'resetGame' });
    this.server.to(roomId).emit('gameStateUpdate', result);
  }

  /** התחלת סיבוב */
  @SubscribeMessage('startRound')
  handleStartRound(@MessageBody() data: { roomId: string }) {
    const { roomId } = data;
    const result = this.gameService.handleAction(roomId, { gameType: 'eratz-ir', action: 'startRound', payload: {} });
    this.server.to(roomId).emit('gameStateUpdate', result);
  }

  /** שמירת תשובות */
  @SubscribeMessage('saveAnswers')
  handleSaveAnswers(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; answers: { [category: string]: string } }
  ) {
    const { roomId, answers } = data;
    const userId = (client as any).user.sub;

    const result = this.gameService.handleAction(roomId, {
      gameType: 'eratz-ir',
      action: 'saveAnswers',
      payload: { playerId: userId, answers },
    });

    this.server.to(roomId).emit('gameStateUpdate', result);
  }

  /** סיום סיבוב (חישוב ניקוד) */
  @SubscribeMessage('finishRound')
  handleFinishRound(@MessageBody() data: { roomId: string }) {
    const { roomId } = data;
    const result = this.gameService.handleAction(roomId, { gameType: 'eratz-ir', action: 'finishRound' });
    this.server.to(roomId).emit('gameStateUpdate', result);
  }
}
