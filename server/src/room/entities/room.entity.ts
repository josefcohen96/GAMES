// src/lobby/entities/room.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('room')
export class Room {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  gameType: string;

  @Column({ default: 2 })
  maxPlayers: number;

  @Column({ default: false })
  isStarted: boolean;
}
