import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { RoomService } from '../../room/room.service';

interface EratzIrGameState {
    roomId: string;
    status: 'waiting' | 'in-progress' | 'playing-round' | 'ended';
    letter: string | null;
    players: string[];
    currentRound: number;
    categories: string[];
    answers: { [playerId: string]: { [category: string]: string } };
    roundScores: { [playerId: string]: number };
    totalScores: { [playerId: string]: number };
}

@Injectable()
export class EratzIrService {
    private gameStates: Map<string, EratzIrGameState> = new Map();
    private hebrewLetters = 'אבגדהוזחטיכלמנסעפצקרשת'.split('');

    constructor(private readonly roomService: RoomService) { }

    startGame(roomId: string) {
        const gameState = this.gameStates.get(roomId);
        if (!gameState) throw new NotFoundException('לא נמצא משחק לחדר הזה');

        if (gameState.status !== 'waiting') {
            throw new BadRequestException('המשחק כבר התחיל');
        }

        if (gameState.players.length < 2) {
            throw new BadRequestException('נדרשים לפחות שני שחקנים כדי להתחיל משחק');
        }

        gameState.status = 'in-progress';
        gameState.currentRound = 0;
        gameState.letter = null;
        gameState.categories = [];
        gameState.answers = {};
        gameState.roundScores = {};
        gameState.totalScores = gameState.players.reduce((acc, player) => {
            acc[player] = 0;
            return acc;
        }, {} as { [playerId: string]: number });

        this.gameStates.set(roomId, gameState);
        return gameState;
    }

    resetGame(roomId: string) {
        const players = this.roomService.getPlayers(roomId);
        const state: EratzIrGameState = {
            roomId,
            players,
            status: 'waiting',
            currentRound: 0,
            letter: null,
            categories: [],
            answers: {},
            roundScores: {},
            totalScores: players.reduce((acc, p) => ({ ...acc, [p]: 0 }), {}),
        };
        this.gameStates.set(roomId, state);
        return this.getState(roomId);
    }

    startRound(roomId: string, categories: string[] = ['עיר', 'ארץ', 'חי', 'צומח']) {
        const gameState = this.gameStates.get(roomId);
        if (!gameState) throw new NotFoundException('לא נמצא משחק לחדר הזה');

        const letter = this.hebrewLetters[Math.floor(Math.random() * this.hebrewLetters.length)];
        gameState.status = 'playing-round';
        gameState.currentRound += 1;
        gameState.letter = letter;
        gameState.categories = categories;
        gameState.answers = {};

        this.gameStates.set(roomId, gameState);
        return this.getState(roomId);
    }


    getState(roomId: string) {
        let gameState = this.gameStates.get(roomId);

        if (!gameState) {
            const players = this.roomService.getPlayers(roomId);
            gameState = {
                roomId,
                status: 'waiting',
                letter: null,
                categories: [],
                answers: {},
                roundScores: {},
                totalScores: players.reduce((acc, p) => ({ ...acc, [p]: 0 }), {}),
                players,
                currentRound: 0,
            };

            this.gameStates.set(roomId, gameState); // save the initial state in the map 
        }

        return gameState;
    }

    /** Utility functions */
    // private normalizeAnswer(answer: string): string {
    //     return answer.trim().replace(/[^א-ת\s]/g, '');
    // }

    // private startsWithLetter(answer: string, letter: string): boolean {
    //     if (!answer) return false;
    //     return answer.charAt(0) === letter;
    // }
}
