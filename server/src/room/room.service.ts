import { Injectable } from '@nestjs/common';
import { LobbyService } from 'src/room/lobby.service';
import { UsersService } from 'src/users/users.service';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class RoomService {

    private roomStates: Map<string, { players: string[] }> = new Map();
    constructor(
        private readonly usersService: UsersService,
    ) { }


    async joinRoom(roomId: string, userId: string): Promise<{ message: string }> {
        await this.usersService.findById(userId);

        const room = this.roomStates.get(roomId);

        if (room) {
            if (room.players.includes(userId)) {
                return { message: `User ${userId} is already in room ${roomId}` };
            }
            room.players.push(userId);
        } else {
            this.roomStates.set(roomId, { players: [userId] });
        }

        return { message: `User ${userId} joined room ${roomId}` };
    }

    leaveRoom(roomId: string, userId: string): { message: string } {
        const room = this.roomStates.get(roomId);
        if (room) {
            room.players = room.players.filter(id => id !== userId);
        }
        return { message: `User ${userId} left room ${roomId}` };
    }

    getPlayers(roomId: string): string[] {
        return this.roomStates.get(roomId)?.players || [];
    }

    deleteRoom(roomId: string) {
        if (!this.roomStates.has(roomId)) {
            throw new NotFoundException(`Room with ID ${roomId} not found`);
        }
        this.roomStates.delete(roomId);
        return { message: `Room with ID ${roomId} deleted successfully` };
    }
}
