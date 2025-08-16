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
import { UnauthorizedException, BadRequestException } from '@nestjs/common';

@WebSocketGateway({
  cors: { origin: '*' },
})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  public server: Server;
  private countdowns: Map<string, NodeJS.Timeout> = new Map();

  constructor(
    private readonly gameService: GameService,
    private readonly roomService: RoomService,
    private readonly jwtService: JwtService,
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
    const userId = (client as any).user?.sub;
    if (userId) {
      this.roomService.cleanupUser(userId);
    }
    console.log(`❌ Client disconnected: ${(client as any).user?.username}`);
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    const { roomId } = data;
    const userId = (client as any).user.sub;
    if (!userId) {
      throw new UnauthorizedException('User ID is required');
    }
    if (!roomId) {
      throw new BadRequestException('Room ID is required');
    }

    // Check current state first; prevent join if game already started
    const currentState = await this.gameService.handleAction(roomId, {
      gameType: 'eratz-ir',
      action: 'state',
    });
    if (currentState.status !== 'waiting') {
      throw new BadRequestException('Cannot join, game already started');
    }

    console.log(`User ${userId} joining room ${roomId}`);
    await this.roomService.joinRoom(roomId, userId);
    client.join(roomId);

    const joinedPlayers = this.roomService.getPlayers(roomId);
    this.server.to(roomId).emit('roomUpdate', {
      message: `${userId} הצטרף לחדר`,
      players: joinedPlayers,
    });

    const refreshedState = await this.gameService.handleAction(roomId, {
      gameType: 'eratz-ir',
      action: 'state',
    });

    this.server.to(roomId).emit('gameStateUpdate', refreshedState);
  }

  @SubscribeMessage('startGame')
  async handleStartGame(@MessageBody() data: { roomId: string }) {
    const { roomId } = data;
    console.log(`Starting game in room: ${roomId}`);
    const result = await this.gameService.handleAction(roomId, {
      gameType: 'eratz-ir',
      action: 'startGame',
    });
    console.log('result', result);
    this.server.to(roomId).emit('gameStateUpdate', result);
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
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
    const result = await this.gameService.handleAction(roomId, {
      gameType: 'eratz-ir',
      action: 'resetGame',
    });
    this.server.to(roomId).emit('gameStateUpdate', result);
  }

  @SubscribeMessage('startRound')
  async handleStartRound(@MessageBody() data: { roomId: string }) {
    const { roomId } = data;
    const result = await this.gameService.handleAction(roomId, {
      gameType: 'eratz-ir',
      action: 'startRound',
      payload: {},
    });
    this.server.to(roomId).emit('gameStateUpdate', result);
  }

  @SubscribeMessage('saveAnswers')
  async handleSaveAnswers(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: { roomId: string; answers: { [category: string]: string } },
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
    const result = await this.gameService.handleAction(roomId, {
      gameType: 'eratz-ir',
      action: 'finishRound',
    });
    this.server.to(roomId).emit('gameStateUpdate', result);
  }

  @SubscribeMessage('finishRoundWithTimer')
  async handleFinishRoundWithTimer(@MessageBody() data: { roomId: string }) {
    const { roomId } = data;

    if (this.countdowns.has(roomId)) {
      // Timer already scheduled
      return;
    }

    this.server.to(roomId).emit('startCountdown');

    const timeout = setTimeout(async () => {
      this.countdowns.delete(roomId);
      const result = await this.gameService.handleAction(roomId, {
        gameType: 'eratz-ir',
        action: 'finishRound',
      });
      this.server.to(roomId).emit('gameStateUpdate', result);
    }, 10000);

    this.countdowns.set(roomId, timeout);
  }
}
