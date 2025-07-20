import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { RoomService } from '../../room/room.service';
import { AiValidationService } from '../../ai-validation/ai-validation.service';

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

    constructor(
        private readonly roomService: RoomService,
        private readonly aiValidator: AiValidationService) { }

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

    async saveAnswers(roomId: string, playerId: string, answers: { [category: string]: string }) {
        const gameState = this.gameStates.get(roomId);
        if (!gameState) throw new NotFoundException('לא נמצא משחק לחדר הזה');
        if (gameState.status !== 'playing-round') {
            throw new BadRequestException('לא ניתן לשמור תשובות - לא בזמן סיבוב');
        }

        // אימות תשובות מול Gemini
        const validation = await this.validateAnswers(roomId, answers);
        // שמירת תשובות
        gameState.answers[playerId] = answers;
        this.gameStates.set(roomId, gameState);

        return { validation, state: gameState };
    }


    finishRound(roomId: string) {
        const gameState = this.gameStates.get(roomId);
        if (!gameState) throw new NotFoundException('לא נמצא משחק לחדר הזה');
        if (gameState.status !== 'playing-round') {
            throw new BadRequestException('אין סיבוב פעיל לסיים');
        }

        // חישוב ניקוד לסיבוב
        const roundScores = this.calculateScores(roomId);
        gameState.roundScores = roundScores;

        // עדכון ניקוד מצטבר
        for (const player of gameState.players) {
            gameState.totalScores[player] += roundScores[player] || 0;
        }

        gameState.status = 'in-progress';
        this.gameStates.set(roomId, gameState);
        return this.getState(roomId);
    }

    private async validateAnswers(roomId: string, answers: { [category: string]: string }) {
        const gameState = this.gameStates.get(roomId);
        if (!gameState) throw new NotFoundException('לא נמצא משחק לחדר הזה');

        const validationResult = await this.aiValidator.validateGameData({
            roomId,
            letter: gameState.letter,
            answers,
            categories: gameState.categories,
        });

        if (!validationResult.valid) {
            throw new BadRequestException(`תשובות לא תקינות: ${validationResult.errors.join(', ')}`);
        }

        return validationResult.details;
    }

    private calculateScores(roomId: string): { [playerId: string]: number } {
        const gameState = this.gameStates.get(roomId);
        if (!gameState) throw new NotFoundException('לא נמצא משחק לחדר הזה');

        const scores: { [playerId: string]: number } = {};
        for (const player of gameState.players) {
            scores[player] = 0;
            for (const category of gameState.categories) {
                const answer = gameState.answers[player]?.[category];
                if (answer) {
                    scores[player] += 1; // כל תשובה נכונה מקבלת נקודה
                }
            }
        }

        return scores;
    }
}
