import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';

interface EratzIrGameState {
    roomId: string;
    letter: string;
    categories: string[];
    players: string[];
    answers: { [playerId: string]: { [category: string]: string } };
    completedPlayers: Set<string>;
    status: 'waiting' | 'playing' | 'ended';
    timer?: NodeJS.Timeout;
    scores: { [playerId: string]: number };
}

@Injectable()
export class EratzIrService {
    private gameStates: Map<string, EratzIrGameState> = new Map();
    private hebrewLetters = 'אבגדהוזחטיכלמנסעפצקרשת'.split('');

    // ✅ Start Game
    startGame(roomId: string, players: string[], categories: string[] = ['עיר', 'ארץ', 'חי', 'צומח']) {
        if (players.length < 2) {
            throw new BadRequestException('צריך לפחות שני שחקנים למשחק ארץ עיר');
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
            completedPlayers: new Set(),
            status: 'playing',
            scores: {},
        };

        this.gameStates.set(roomId, gameState);
        return { message: `משחק התחיל עם האות ${letter}`, categories, letter, players };
    }

    // ✅ Submit Answers
    submitAnswers(roomId: string, playerId: string, answers: { [category: string]: string }) {
        const gameState = this.gameStates.get(roomId);
        if (!gameState) throw new NotFoundException('לא נמצא משחק לחדר הזה');
        if (gameState.status !== 'playing') {
            throw new BadRequestException('המשחק הסתיים או לא התחיל');
        }

        gameState.answers[playerId] = answers;
        gameState.completedPlayers.add(playerId);

        // אם זה הראשון שסיים → מפעילים טיימר 10 שניות
        if (gameState.completedPlayers.size === 1 && gameState.players.length > 1) {
            gameState.timer = setTimeout(() => {
                this.calculateScores(roomId);
            }, 10000);
        }

        // אם כולם סיימו → סיימנו לפני הזמן
        if (gameState.completedPlayers.size === gameState.players.length) {
            if (gameState.timer) clearTimeout(gameState.timer);
            this.calculateScores(roomId);
        }

        return { message: 'תשובות נשלחו', answers };
    }

    // ✅ ניקוי ותיקוף התשובה
    private normalizeAnswer(answer: string): string {
        return answer.trim().replace(/[^א-ת\s]/g, ''); // משאיר אותיות ורווחים בלבד
    }

    private startsWithLetter(answer: string, letter: string): boolean {
        if (!answer) return false;
        return answer.charAt(0) === letter;
    }

    // ✅ Calculate Scores
    private calculateScores(roomId: string) {
        const gameState = this.gameStates.get(roomId);
        if (!gameState) return;

        gameState.status = 'ended';
        const scores: { [playerId: string]: number } = {};

        for (const player of gameState.players) {
            scores[player] = 0;
        }

        for (const category of gameState.categories) {
            const categoryAnswers: { [answer: string]: string[] } = {};

            for (const [player, answers] of Object.entries(gameState.answers)) {
                let ans = answers[category] || '';
                ans = this.normalizeAnswer(ans);

                // ✅ בדיקה: חייב להתחיל באות המשחק
                if (!this.startsWithLetter(ans, gameState.letter)) continue;

                if (!categoryAnswers[ans]) categoryAnswers[ans] = [];
                categoryAnswers[ans].push(player);
            }

            for (const [answer, players] of Object.entries(categoryAnswers)) {
                if (!answer) continue; // לא ענה
                const points = players.length === 1 ? 10 : 5; // ייחודי = 10, חוזר = 5
                players.forEach(p => scores[p] += points);
            }
        }

        gameState.scores = scores;
        this.gameStates.set(roomId, gameState);
    }

    // ✅ Get State
    getState(roomId: string) {
        const gameState = this.gameStates.get(roomId);
        if (!gameState) throw new NotFoundException('לא נמצא משחק לחדר הזה');
        return {
            status: gameState.status,
            letter: gameState.letter,
            categories: gameState.categories,
            answers: gameState.answers,
            scores: gameState.status === 'ended' ? gameState.scores : null,
        };
    }

    // ✅ End Game
    endGame(roomId: string) {
        if (!this.gameStates.has(roomId)) throw new NotFoundException('לא נמצא משחק');
        this.calculateScores(roomId);
        return { message: 'משחק הסתיים', scores: this.gameStates.get(roomId)?.scores };
    }
}
