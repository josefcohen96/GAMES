import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { Room } from './entities/room.entity';
import { RoomService } from './room.service';


@Injectable()
export class LobbyService {
    constructor(
        private readonly roomService: RoomService,
    ) { }

    async getAllRooms(): Promise<Room[]> {
        return this.roomService.findAll();
    }

    async createRoom(dto: CreateRoomDto): Promise<Room> {
        const { userId, ...roomData } = dto;

        const savedRoom = this.roomService.createRoom(roomData);  // await ?

        await this.roomService.joinRoom(savedRoom.id, userId);

        return savedRoom;
    }

    async deleteRoom(roomid: string): Promise<{ message: string }> {
        console.log('Deleting room ID:', roomid);

        const result = await this.roomService.delete(roomid);
        if (result.affected === 0) {
            throw new NotFoundException(`Room with ID ${roomid} not found`);
        }
        return { message: `Room with ID ${roomid} deleted successfully` };
    }
}
