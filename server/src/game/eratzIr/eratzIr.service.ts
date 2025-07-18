import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { RoomService } from '../../room/room.service';

interface EratzIrGameState {
    roomId: string;
    players: string[];
    status: 'waiting' | 'playing' | 'ended';
    currentRound: number;
    letter: string | null;
    categories: string[];
    answers: { [playerId: string]: { [category: string]: string } };
    roundScores: { [playerId: string]: number };
    totalScores: { [playerId: string]: number };
}

@Injectable()
export class EratzIrService {
    private gameStates: Map<string, EratzIrGameState> = new Map();
    private hebrewLetters = 'אבגדהוזחטיכלמנסעפצקרשת'.split('');

    constructor(private readonly roomService: RoomService) {}

    /** ✅ Reset Game (איפוס הכל) */
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

    /** ✅ Start a new round */
    startRound(roomId: string, categories: string[] = ['עיר', 'ארץ', 'חי', 'צומח']) {
        const gameState = this.gameStates.get(roomId);
        if (!gameState) throw new NotFoundException('לא נמצא משחק לחדר הזה');

        const letter = this.hebrewLetters[Math.floor(Math.random() * this.hebrewLetters.length)];
        gameState.status = 'playing';
        gameState.currentRound += 1;
        gameState.letter = letter;
        gameState.categories = categories;
        gameState.answers = {};
        gameState.roundScores = {};

        this.gameStates.set(roomId, gameState);
        return this.getState(roomId);
    }

    /** ✅ Save answers temporarily */
    saveAnswers(roomId: string, playerId: string, answers: { [category: string]: string }) {
        const gameState = this.gameStates.get(roomId);
        if (!gameState) throw new NotFoundException('לא נמצא משחק לחדר הזה');
        if (gameState.status !== 'playing') throw new BadRequestException('המשחק לא פעיל');

        gameState.answers[playerId] = answers;
        return this.getState(roomId);
    }

    /** ✅ Finish round – calculate scores */
    finishRound(roomId: string) {
        const gameState = this.gameStates.get(roomId);
        if (!gameState) throw new NotFoundException('לא נמצא משחק לחדר הזה');

        gameState.status = 'ended';
        const scores: { [playerId: string]: number } = {};
        for (const player of gameState.players) scores[player] = 0;

        for (const category of gameState.categories) {
            const categoryAnswers: { [answer: string]: string[] } = {};

            for (const [player, answers] of Object.entries(gameState.answers)) {
                let ans = this.normalizeAnswer(answers[category] || '');
                if (!this.startsWithLetter(ans, gameState.letter!)) continue;

                if (!categoryAnswers[ans]) categoryAnswers[ans] = [];
                categoryAnswers[ans].push(player);
            }

            for (const [answer, players] of Object.entries(categoryAnswers)) {
                if (!answer) continue;
                const points = players.length === 1 ? 10 : 5;
                players.forEach(p => {
                    scores[p] += points;
                    gameState.totalScores[p] += points;
                });
            }
        }

        gameState.roundScores = scores;
        this.gameStates.set(roomId, gameState);

        return this.getState(roomId);
    }

    /** ✅ Get game state */
    getState(roomId: string) {
        const gameState = this.gameStates.get(roomId);
        if (!gameState) {
            return {
                status: 'waiting',
                letter: null,
                categories: [],
                answers: {},
                roundScores: {},
                totalScores: {},
                players: this.roomService.getPlayers(roomId),
                currentRound: 0,
            };
        }
        return gameState;
    }

    /** ✅ Utility functions */
    private normalizeAnswer(answer: string): string {
        return answer.trim().replace(/[^א-ת\s]/g, '');
    }

    private startsWithLetter(answer: string, letter: string): boolean {
        if (!answer) return false;
        return answer.charAt(0) === letter;
    }
}
