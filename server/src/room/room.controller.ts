import { Body, Controller, Post, Get, Param, Delete, BadRequestException } from '@nestjs/common';
import { RoomService } from './room.service';
import { LobbyService } from './lobby.service';
import { CreateRoomDto } from './dto/create-room.dto';

@Controller('room')
export class RoomController {
    constructor(
        private readonly roomService: RoomService,
        private readonly lobbyService: LobbyService
    ) { }

    @Post(':roomId/join')
    joinRoom(
        @Param('roomId') roomId: string,
        @Body() body: { userId: string }
    ) {
        return this.roomService.joinRoom(roomId, body.userId);
    }

    @Post(':roomId/leave')
    leaveRoom(
        @Param('roomId') roomId: string,
        @Body() body: { userId: string }
    ) {
        return this.roomService.leaveRoom(roomId, body.userId);
    }

    @Get(':roomId/players')
    getPlayers(@Param('roomId') roomId: string) {
        return this.roomService.getPlayers(roomId);
    }

    @Post()
    async createRoom(@Body() room: CreateRoomDto) {
        return this.lobbyService.createRoom(room);
    }

    @Delete(':roomid')
    async deleteRoom(@Param('roomid') roomid: string) {
        if (!roomid) {
            throw new BadRequestException('Room ID must be provided');
        }
        return this.lobbyService.deleteRoom(roomid);
    }

    @Get()
    async getAllRooms() {
        return this.lobbyService.getAllRooms();
    }
}
