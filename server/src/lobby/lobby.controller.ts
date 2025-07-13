import { Controller, Get, Post, Body, Param, Delete, BadRequestException } from '@nestjs/common';
import { LobbyService } from './lobby.service';
import { CreateRoomDto } from '../room/dto/create-room.dto';
@Controller('lobby')
export class LobbyController {
    constructor(private readonly lobbyService: LobbyService) { }
    // Get api/rooms
    // Post api/rooms:roomObj?body{} :object 
    // Delete api/rooms:roomId

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
