export enum EnglishGameType {
    VOCABULARY = 'vocabulary',
    GRAMMAR = 'grammar',
    READING = 'reading',
    LISTENING = 'listening',
    WRITING = 'writing',
    MIXED = 'mixed',
}

export enum EnglishGameStatus {
    WAITING = 'waiting',
    PLAYING = 'playing',
    FINISHED = 'finished',
}

export enum EnglishGameLevel {
    BEGINNER = 'beginner',
    INTERMEDIATE = 'intermediate',
    ADVANCED = 'advanced',
}


export interface EnglishQuestion {
    id: string;
    type: EnglishGameType;
    level: EnglishGameLevel;
    question: string;
    options?: string[];
    correctAnswer: string | string[];
    explanation: string;
    points: number;
    timeLimit?: number;
}

export interface EnglishGameState {
    roomId: string;
    gameType: EnglishGameType;
    level: EnglishGameLevel;
    players: {
        [playerId: string]: {
            score: number;
            currentQuestion: number;
            answers: { [questionId: string]: string | string[] };
            timeRemaining: number;
            isActive: boolean;
            askedQuestionIds: string[]; // Track questions already answered by the player
        };
    };
    currentRound: number;
    totalRounds: number;
    questions: EnglishQuestion[];
    gameStatus: EnglishGameStatus;
    startTime?: Date;
    endTime?: Date;
}


