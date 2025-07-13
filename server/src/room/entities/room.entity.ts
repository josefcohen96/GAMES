// src/lobby/entities/room.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Room {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  gameType: string; // סוג המשחק: "war", "chess", "memory" וכו'

  @Column({ default: 2 })
  maxPlayers: number;

  @Column({ default: 0 })
  currentPlayers: number;

  @Column({ default: false })
  isStarted: boolean;
}