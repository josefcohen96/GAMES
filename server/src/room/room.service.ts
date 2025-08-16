import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { LobbyService } from './lobby.service';

@Injectable()
export class RoomService {
  private roomStates: Map<string, { players: string[] }> = new Map();
  private userToRooms: Map<string, Set<string>> = new Map();

  constructor(private readonly lobbyService: LobbyService) {}

  async joinRoom(roomId: string, userId: string): Promise<{ message: string; players: string[] }> {
    // Enforce maxPlayers from DB
    const roomEntity = await this.lobbyService.getRoomById(roomId);
    const state = this.roomStates.get(roomId) || { players: [] };

    if (!state.players.includes(userId)) {
      if (state.players.length >= roomEntity.maxPlayers) {
        throw new BadRequestException('Room is full');
      }
      state.players.push(userId);
      this.roomStates.set(roomId, state);
    }

    if (!this.userToRooms.has(userId)) this.userToRooms.set(userId, new Set());
    this.userToRooms.get(userId)!.add(roomId);

    return { message: `User ${userId} joined room ${roomId}`, players: this.getPlayers(roomId) };
  }

  leaveRoom(roomId: string, userId: string): { message: string; players: string[] } {
    const room = this.roomStates.get(roomId);
    if (!room) throw new NotFoundException('Room not found');

    room.players = room.players.filter((p) => p !== userId);
    this.userToRooms.get(userId)?.delete(roomId);

    return { message: `User ${userId} left room ${roomId}`, players: this.getPlayers(roomId) };
  }

  getPlayers(roomId: string): string[] {
    return this.roomStates.get(roomId)?.players || [];
  }

  cleanupUser(userId: string) {
    const rooms = this.userToRooms.get(userId);
    if (!rooms) return;
    for (const roomId of rooms) {
      const room = this.roomStates.get(roomId);
      if (!room) continue;
      room.players = room.players.filter((p) => p !== userId);
    }
    this.userToRooms.delete(userId);
  }
}
