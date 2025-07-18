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

  /** פעולות משחק */
  @SubscribeMessage('gameAction')
  handleGameAction(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; gameType: string; action: string; payload?: any }
  ) {
    const { roomId, gameType, action, payload } = data;
    const result = this.gameService.handleAction(roomId, { gameType, action, payload });

    this.server.to(roomId).emit('gameStateUpdate', result);
  }
}
