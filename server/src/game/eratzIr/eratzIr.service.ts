import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { RoomService } from '../../room/room.service';

interface EratzIrGameState {
    roomId: string;
    letter: string;
    categories: string[];
    players: string[];
    answers: { [playerId: string]: { [category: string]: string } };
    status: 'waiting' | 'playing' | 'ended';
    scores: { [playerId: string]: number };
}

@Injectable()
export class EratzIrService {
    private gameStates: Map<string, EratzIrGameState> = new Map();
    private hebrewLetters = 'אבגדהוזחטיכלמנסעפצקרשת'.split('');

    constructor(private readonly roomService: RoomService) { }

    /** ✅ Start Game */
    startGame(roomId: string, categories: string[] = ['עיר', 'ארץ', 'חי', 'צומח']) {
        const players = this.roomService.getPlayers(roomId);
        if (players.length < 2) {
            throw new BadRequestException('צריך לפחות שני שחקנים להתחלת המשחק');
        }
        if (this.gameStates.has(roomId)) {
            throw new BadRequestException('כבר יש משחק פעיל בחדר הזה');
        }

        const letter = this.hebrewLetters[Math.floor(Math.random() * this.hebrewLetters.length)];
        const gameState: EratzIrGameState = {
            roomId,
            letter,
            categories,
            players,
            answers: {},
            status: 'playing',
            scores: {},
        };

        this.gameStates.set(roomId, gameState);
        return { message: `משחק התחיל עם האות ${letter}`, letter, categories, players };
    }

    /** ✅ Save answers temporarily (before submitAll) */
    saveAnswers(roomId: string, playerId: string, answers: { [category: string]: string }) {
        const gameState = this.gameStates.get(roomId);
        if (!gameState) throw new NotFoundException('לא נמצא משחק לחדר הזה');
        if (gameState.status !== 'playing') throw new BadRequestException('המשחק הסתיים או לא התחיל');

        gameState.answers[playerId] = answers;
        return { message: 'תשובות זמניות נשמרו', answers };
    }

    /** ✅ Finalize game and calculate scores */
    submitAll(roomId: string) {
        const gameState = this.gameStates.get(roomId);
        if (!gameState) throw new NotFoundException('לא נמצא משחק לחדר הזה');

        gameState.status = 'ended';
        const scores: { [playerId: string]: number } = {};
        for (const player of gameState.players) scores[player] = 0;

        for (const category of gameState.categories) {
            const categoryAnswers: { [answer: string]: string[] } = {};

            for (const [player, answers] of Object.entries(gameState.answers)) {
                let ans = this.normalizeAnswer(answers[category] || '');
                if (!this.startsWithLetter(ans, gameState.letter)) continue;

                if (!categoryAnswers[ans]) categoryAnswers[ans] = [];
                categoryAnswers[ans].push(player);
            }

            for (const [answer, players] of Object.entries(categoryAnswers)) {
                if (!answer) continue;
                const points = players.length === 1 ? 10 : 5;
                players.forEach(p => scores[p] += points);
            }
        }

        gameState.scores = scores;
        this.gameStates.set(roomId, gameState);

        return {
            message: 'תוצאות חושבו בהצלחה',
            scores,
            answers: gameState.answers
        };
    }

    /** ✅ Utility Functions */
    private normalizeAnswer(answer: string): string {
        return answer.trim().replace(/[^א-ת\s]/g, '');
    }

    private startsWithLetter(answer: string, letter: string): boolean {
        if (!answer) return false;
        return answer.charAt(0) === letter;
    }

    getState(roomId: string) {
        const gameState = this.gameStates.get(roomId);
        if (!gameState) {
            return {
                status: 'waiting',
                letter: null,
                categories: [],
                answers: {},
                scores: null,
                players: this.roomService.getPlayers(roomId) // השג נתוני חדר
            };
        }
        return {
            status: gameState.status,
            letter: gameState.letter,
            categories: gameState.categories,
            answers: gameState.answers,
            scores: gameState.status === 'ended' ? gameState.scores : null,
            players: gameState.players
        };
    }

    endGame(roomId: string) {
        const gameState = this.gameStates.get(roomId);
        if (!gameState) throw new NotFoundException('לא נמצא משחק לחדר הזה');

        this.gameStates.delete(roomId);
        return { message: `המשחק בחדר ${roomId} הסתיים בהצלחה` };
    }
}
