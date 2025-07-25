import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class RoomService {
  private roomStates: Map<string, { players: string[] }> = new Map();

  joinRoom(roomId: string, userId: string): { message: string; players: string[] } {
    const room = this.roomStates.get(roomId);

    if (room) {
      if (!room.players.includes(userId)) {
        room.players.push(userId);
      }
    } else {
      this.roomStates.set(roomId, { players: [userId] });
    }

    return { message: `User ${userId} joined room ${roomId}`, players: this.getPlayers(roomId) };
  }

  leaveRoom(roomId: string, userId: string): { message: string; players: string[] } {
    const room = this.roomStates.get(roomId);
    if (!room) throw new NotFoundException('Room not found');

    room.players = room.players.filter((p) => p !== userId);

    return { message: `User ${userId} left room ${roomId}`, players: this.getPlayers(roomId) };
  }

   getPlayers(roomId: string): string[] {
    return this.roomStates.get(roomId)?.players || [];
  }
}
