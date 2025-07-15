import { Controller, Get, Post, Body, Param, Delete, BadRequestException } from '@nestjs/common';
import { LobbyService } from '../room/lobby.service';
import { CreateRoomDto } from '../room/dto/create-room.dto';
@Controller('lobby')
export class LobbyController {
    constructor(private readonly lobbyService: LobbyService) { }
    // Get api/rooms
    // Post api/rooms:roomObj?body{} :object 
    // Delete api/rooms:roomId
}
