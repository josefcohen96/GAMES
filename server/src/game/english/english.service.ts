import { Injectable, BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { EnglishGameLevel, EnglishGameState, EnglishGameStatus,EnglishGameType,EnglishQuestion } from './english.constants';

@Injectable()
export class EnglishService {
    private games: Map<string, EnglishGameState> = new Map();
    private questionsDatabase: EnglishQuestion[] = [];

    constructor() {
        this.loadQuestions();
    }

    private loadQuestions() {
        try {
            // const questionsPath = path.join(__dirname, 'questions.json');
            const questionsPath = path.join(__dirname, 'questions_best_practice.json');
            const questionsData = JSON.parse(fs.readFileSync(questionsPath, 'utf8'));
            
            // Flatten the questions from all types and levels
            Object.keys(questionsData).forEach((type) => {
                Object.keys(questionsData[type]).forEach((level) => {
                    this.questionsDatabase.push(...questionsData[type][level]);
                });
            });
            
        } catch (error) {
            console.error('Error loading questions:', error);
            throw new Error('Failed to load English questions');
        }
    }

    startGame(
        roomId: string,
        gameType: EnglishGameType,
        level: EnglishGameLevel,
        players: string[],
        questionCount = 10,
    ): EnglishGameState {
        // Filter questions based on game type and level
        let filteredQuestions = this.questionsDatabase.filter(
            (q) => q.level === level && (gameType === EnglishGameType.MIXED || q.type === gameType),
        );

    // Shuffle and select requested number of questions
    filteredQuestions = this.shuffleArray(filteredQuestions).slice(0, questionCount);

        if (filteredQuestions.length === 0) {
            throw new BadRequestException('No questions available for the selected type and level');
        }

        const gameState: EnglishGameState = {
            roomId,
            gameType,
            level,
            players: {},
            currentRound: 1,
            totalRounds: filteredQuestions.length,
            questions: filteredQuestions,
            gameStatus: EnglishGameStatus.WAITING,
            startTime: new Date(),
        };

        // Initialize player states
        players.forEach((playerId) => {
            gameState.players[playerId] = {
                score: 0,
                currentQuestion: 0,
                answers: {},
                timeRemaining: 0,
                isActive: true,
                askedQuestionIds: [],
            };
        });

        this.games.set(roomId, gameState);
        return gameState;
    }

    startRound(roomId: string): EnglishGameState {
        const game = this.games.get(roomId);
        if (!game) {
            throw new BadRequestException('Game not found');
        }

        if (game.gameStatus !== EnglishGameStatus.WAITING && game.gameStatus !== EnglishGameStatus.PLAYING) {
            throw new BadRequestException('Game is not in a valid state to start round');
        }

        game.gameStatus = EnglishGameStatus.PLAYING;
        game.currentRound = 1;

        // Set time limits for current question
        const currentQuestion = game.questions[game.currentRound - 1];
        Object.keys(game.players).forEach((playerId) => {
            if (game.players[playerId].isActive) {
                game.players[playerId].timeRemaining = currentQuestion.timeLimit || 30;
            }
        });

        return game;
    }

    submitAnswer(
        roomId: string,
        playerId: string,
        questionId: string,
        answer: string | string[],
    ): EnglishGameState {
        const game = this.games.get(roomId);
        if (!game) {
            throw new BadRequestException('Game not found');
        }

        if (!game.players[playerId]) {
            throw new BadRequestException('Player not found in game');
        }

        if (game.gameStatus !== EnglishGameStatus.PLAYING) {
            throw new BadRequestException('Game is not currently playing');
        }

        const player = game.players[playerId];
        const question = game.questions.find((q) => q.id === questionId);

        if (!question) {
            throw new BadRequestException('Question not found');
        }

        // Store the answer
        player.answers[questionId] = answer;

        // Check if answer is correct
        const isCorrect = this.checkAnswer(answer, question.correctAnswer);
        if (isCorrect) {
            player.score += question.points;
        }
        player.askedQuestionIds.push(questionId); // Track answered questions
        
        // Move to next question
        player.currentQuestion++;

        // Check if all players have answered
        const allPlayersAnswered = Object.values(game.players).every(
            (p) => p.currentQuestion >= game.currentRound || !p.isActive,
        );

        if (allPlayersAnswered) {
            this.nextRound(roomId);
        }

        return game;
    }

    getState(roomId: string): EnglishGameState | null {
        return this.games.get(roomId) || null;
    }

    endGame(roomId: string): { winner: string; finalScores: { [playerId: string]: number } } {
        const game = this.games.get(roomId);
        if (!game) {
            throw new BadRequestException('Game not found');
        }

        game.gameStatus = EnglishGameStatus.FINISHED;
        game.endTime = new Date();

        // Calculate final scores
        const finalScores: { [playerId: string]: number } = {};
        Object.keys(game.players).forEach((playerId) => {
            finalScores[playerId] = game.players[playerId].score;
        });

        // Find winner
        const winner = Object.keys(finalScores).reduce((a, b) =>
            finalScores[a] > finalScores[b] ? a : b,
        );

        // Clean up
        this.games.delete(roomId);

        return { winner, finalScores };
    }

    getLeaderboard(roomId: string): { playerId: string; score: number; rank: number }[] {
        const game = this.games.get(roomId);
        if (!game) {
            throw new BadRequestException('Game not found');
        }

        const scores = Object.entries(game.players).map(([playerId, player]) => ({
            playerId,
            score: player.score,
        }));

        return scores
            .sort((a, b) => b.score - a.score)
            .map((entry, index) => ({
                ...entry,
                rank: index + 1,
            }));
    }

    getGameOptions(): {
        types: string[];
        levels: string[];
        questionCounts: { [key: string]: number };
    } {
        const types = Object.values(EnglishGameType);
        const levels = Object.values(EnglishGameLevel);

        const questionCounts: { [key: string]: number } = {};
        types.forEach((type) => {
            levels.forEach((level) => {
                const key = `${type}_${level}`;
                questionCounts[key] = this.questionsDatabase.filter(
                    (q) => q.level === level && (type === EnglishGameType.MIXED || q.type === type),
                ).length;
            });
        });

        return { types, levels, questionCounts };
    }

    private nextRound(roomId: string): void {
        const game = this.games.get(roomId);
        if (!game) return;

        game.currentRound++;

        if (game.currentRound > game.totalRounds) {
            game.gameStatus = EnglishGameStatus.FINISHED;
            return;
        }

        // Set time limits for next question
        const currentQuestion = game.questions[game.currentRound - 1];
        Object.keys(game.players).forEach((playerId) => {
            if (game.players[playerId].isActive) {
                game.players[playerId].timeRemaining = currentQuestion.timeLimit || 30;
            }
        });
    }

    private checkAnswer(userAnswer: string | string[], correctAnswer: string | string[]): boolean {
        if (Array.isArray(correctAnswer)) {
            if (!Array.isArray(userAnswer)) return false;
            return userAnswer.length === correctAnswer.length &&
                userAnswer.every((ans, index) => ans === correctAnswer[index]);
        } else {
            return userAnswer === correctAnswer;
        }
    }

    private shuffleArray<T>(array: T[]): T[] {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    // Add more questions to the database
    addQuestion(question: EnglishQuestion): void {
        this.questionsDatabase.push(question);
    }
}
