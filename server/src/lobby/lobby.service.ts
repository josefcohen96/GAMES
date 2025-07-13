import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRoomDto } from '../room/dto/create-room.dto';
import { Room } from '../room/entities/room.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { RoomService } from '../room/room.service';


@Injectable()
export class LobbyService {
    constructor(
        @InjectRepository(Room)
        private readonly roomRepository: Repository<Room>,
        private readonly roomService: RoomService,
    ) { }

    async getAllRooms(): Promise<Room[]> {
        return this.roomRepository.find();
    }

    async createRoom(dto: CreateRoomDto): Promise<Room> {
        const { userId, ...roomData } = dto;

        const room = this.roomRepository.create(roomData);
        const savedRoom = await this.roomRepository.save(room);

        // הוספת היוצר כשחקן לחדר בזיכרון
        await this.roomService.joinRoom(savedRoom.id, userId);

        return savedRoom;
    }

    async deleteRoom(roomid: string): Promise<{ message: string }> {
        console.log('Deleting room ID:', roomid);

        const result = await this.roomRepository.delete(roomid);
        if (result.affected === 0) {
            throw new NotFoundException(`Room with ID ${roomid} not found`);
        }
        return { message: `Room with ID ${roomid} deleted successfully` };
    }
}
