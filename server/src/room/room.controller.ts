import { Body, Controller, Post, Get, Param } from '@nestjs/common';
import { RoomService } from './room.service';

@Controller('room')
export class RoomController {
    constructor(private readonly roomService: RoomService) { }

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
}
