
import { IsString, Min, Max } from 'class-validator';

export class CreateRoomDto {
    @IsString()
    name: string;

    gameType: string; //  "war", "chess", "memory" 

    @Min(2)
    @Max(10)
    maxPlayers: number;

    password?: string; // Optional field for password-protected rooms

    userId: string; //
}