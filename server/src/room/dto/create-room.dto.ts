export class CreateRoomDto {
    name: string;
    gameType: string; //  "war", "chess", "memory" 
    maxPlayers: number;
    password?: string; // Optional field for password-protected rooms
    userId: string; //

}