import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { GameService } from './game.service';

@WebSocketGateway({
  cors: {
    origin: '*', // אפשר לשים את ה-Frontend URL במקום *
  },
})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(
    private readonly gameService: GameService,
    private readonly jwtService: JwtService,
  ) { }

  /** ✅ אימות חיבור */
  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.split(' ')[1];

      if (!token) {
        throw new UnauthorizedException('Missing token');
      }

      // ✅ אימות JWT
      const decoded = this.jwtService.verify(token);
      (client as any).user = decoded; // שומרים את פרטי המשתמש על הסוקט

      console.log(`✅ Client connected: ${decoded.username}`);
    } catch (err) {
      console.log('❌ Unauthorized socket connection');
      client.disconnect();
    }
  }

  /** ✅ התנתקות */
  handleDisconnect(client: Socket) {
    const username = (client as any).user?.username || 'Unknown';
    console.log(`❌ Client disconnected: ${username}`);
  }

  /** ✅ הצטרפות לחדר */
  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    const { roomId } = data;
    client.join(roomId);

    console.log(`User ${(client as any).user.username} joined room ${roomId}`);

    this.server.to(roomId).emit('roomUpdate', {
      message: `${(client as any).user.username} הצטרף לחדר`,
    });
  }

  /** ✅ יציאה מחדר */
  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    const { roomId } = data;
    client.leave(roomId);

    console.log(`User ${(client as any).user.username} left room ${roomId}`);

    this.server.to(roomId).emit('roomUpdate', {
      message: `${(client as any).user.username} יצא מהחדר`,
    });
  }

  /** ✅ פעולות משחק */
  @SubscribeMessage('gameAction')
  handleGameAction(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: { roomId: string; gameType: string; action: string; payload?: any },
  ) {
    const { roomId, gameType, action, payload } = data;

    console.log(`Game action: ${action} in room ${roomId}`);

    const result = this.gameService.handleAction(roomId, {
      gameType,
      action,
      payload: { ...payload, playerId: (client as any).user.sub }, // מוסיף ID מהטוקן
    });

    // ✅ שולח את הסטייט החדש לכל השחקנים בחדר
    this.server.to(roomId).emit('gameStateUpdate', result);
  }
}
