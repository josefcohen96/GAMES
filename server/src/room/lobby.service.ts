import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { Room } from './entities/room.entity';
import { RoomService } from './room.service';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class LobbyService {
    constructor(
        private readonly roomService: RoomService,

        @InjectRepository(Room)
        private readonly lobbyRepo: Repository<Room>,
    ) { }

    async getAllRooms(): Promise<Room[]> {
        return this.lobbyRepo.find();
    }

    async createRoom(dto: CreateRoomDto): Promise<Room> {
        const { ...roomData } = dto;
        console.log('Creating room with data:', roomData);
        const savedRoom = this.lobbyRepo.create(roomData);
        console.log('Room created:', savedRoom);
        await this.lobbyRepo.save(savedRoom);
        return savedRoom;
    }

    async deleteRoom(roomid: string): Promise<{ message: string }> {
        console.log('Deleting room ID:', roomid);

        const result = await this.lobbyRepo.delete(roomid);
        if (result.affected === 0) {
            throw new NotFoundException(`Room with ID ${roomid} not found`);
        }
        return { message: `Room with ID ${roomid} deleted successfully` };
    }

    async deleteAllRooms(): Promise<{ message: string }> {
        await this.lobbyRepo.clear();
        return { message: `All rooms deleted successfully` };
    }
}
