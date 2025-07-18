import { Body, Controller, Post, Get, Param, Delete, BadRequestException, Req } from '@nestjs/common';
import { RoomService } from './room.service';
import { LobbyService } from './lobby.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('room')
export class RoomController {
    constructor(
        private readonly roomService: RoomService,
        private readonly lobbyService: LobbyService
    ) { }

    @Get()
    async getAllRooms() {
        return this.lobbyService.getAllRooms();
    }

    @Post()
    async createRoom(@Body() room: CreateRoomDto) {
        console.log('Creating room with data:', room);
        return this.lobbyService.createRoom(room);
    }

    @Get(':roomId/players')
    getPlayers(@Param('roomId') roomId: string) {
        return this.roomService.getPlayers(roomId);
    }

    @Delete('deleteall')
    async deleteAllRooms() {
        return this.lobbyService.deleteAllRooms();
    }
    
    @Delete(':roomid')
    async deleteRoom(@Param('roomid') roomid: string) {
        if (!roomid) {
            throw new BadRequestException('Room ID must be provided');
        }
        return this.lobbyService.deleteRoom(roomid);
    }

    @Post(':roomId/join')
    joinRoom(@Param('roomId') roomId: string, @Req() req) {
        const userId = req.user.userId; // מגיע מה-JWT
        return this.roomService.joinRoom(roomId, userId);
    }

    @Post(':roomId/leave')
    leaveRoom(@Param('roomId') roomId: string, @Req() req) {
        const userId = req.user.userId; // מגיע מה-JWT
        return this.roomService.leaveRoom(roomId, userId);
    }

    // deleteall rooms


}
