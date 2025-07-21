import { WebSocketGateway, SubscribeMessage, WebSocketServer, ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameService } from './game.service';
import { RoomService } from '../room/room.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';

@WebSocketGateway({
  cors: { origin: '*' },
})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  public server: Server;

  constructor(
    private readonly gameService: GameService,
    private readonly roomService: RoomService,
    private readonly jwtService: JwtService
  ) { }

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

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(@ConnectedSocket() client: Socket, @MessageBody() data: { roomId: string }) {
    const { roomId } = data;
    const userId = (client as any).user.sub;
    if (!userId) {
      throw new UnauthorizedException('User ID is required');
    }
    if (!roomId) {
      throw new BadRequestException('Room ID is required');
    }

    console.log(`User ${userId} joining room ${roomId}`);
    client.join(roomId);  // Join the room in Socket.IO

    const result = this.roomService.joinRoom(roomId, userId);  // if not exists, create it else join it

    this.server.to(roomId).emit('roomUpdate', {  // Notify all clients in the room
      message: `${userId} הצטרף לחדר`,
      players: result.players,
    });

    const currentState = await this.gameService.handleAction(roomId, {
      gameType: 'eratz-ir',
      action: 'state'
    });

    if (currentState.status !== 'waiting') {
      throw new BadRequestException('Cannot join, game already started');
    }

    this.server.to(roomId).emit('gameStateUpdate', currentState);
  }

  @SubscribeMessage('startGame')
  async handleStartGame(@MessageBody() data: { roomId: string }) {
    const { roomId } = data;
    console.log(`Starting game in room: ${roomId}`);
    const result = await this.gameService.handleAction(roomId, { gameType: 'eratz-ir', action: 'startGame' });
    console.log("result", result);
    this.server.to(roomId).emit('gameStateUpdate', result);
  }


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

  @SubscribeMessage('resetGame')
  async handleResetGame(@MessageBody() data: { roomId: string }) {
    const { roomId } = data;
    const result = await this.gameService.handleAction(roomId, { gameType: 'eratz-ir', action: 'resetGame' });
    this.server.to(roomId).emit('gameStateUpdate', result);
  }

  @SubscribeMessage('startRound')
  async handleStartRound(@MessageBody() data: { roomId: string }) {
    const { roomId } = data;
    const result = await this.gameService.handleAction(roomId, { gameType: 'eratz-ir', action: 'startRound', payload: {} });
    this.server.to(roomId).emit('gameStateUpdate', result);
  }

  @SubscribeMessage('saveAnswers')
  async handleSaveAnswers(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; answers: { [category: string]: string } }
  ) {
    const { roomId, answers } = data;
    const userId = (client as any).user.sub;

    const { state } = await this.gameService.handleAction(roomId, {
      gameType: 'eratz-ir',
      action: 'saveAnswers',
      payload: { playerId: userId, answers },
    });

    this.server.to(roomId).emit('gameStateUpdate', state);
  }
  @SubscribeMessage('finishRound')
  async handleFinishRound(@MessageBody() data: { roomId: string }) {
    const { roomId } = data;
    const result = await this.gameService.handleAction(roomId, { gameType: 'eratz-ir', action: 'finishRound' });
    this.server.to(roomId).emit('gameStateUpdate', result);
  }

  @SubscribeMessage('finishRoundWithTimer')
  async handleFinishRoundWithTimer(@MessageBody() data: { roomId: string }) {
    const { roomId } = data;

    // שדר לכל המשתמשים שהטיימר מתחיל
    this.server.to(roomId).emit('startCountdown');

    // הפעל טיימר בשרת
    setTimeout(async () => {
      const result = await this.gameService.handleAction(roomId, {
        gameType: 'eratz-ir',
        action: 'finishRound',
      });
      this.server.to(roomId).emit('gameStateUpdate', result);
    }, 10000);
  }
}
