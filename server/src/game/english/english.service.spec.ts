import { Test, TestingModule } from '@nestjs/testing';
import { EnglishService } from './english.service';
import { BadRequestException } from '@nestjs/common';

describe('EnglishService', () => {
  let service: EnglishService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EnglishService],
    }).compile();

    service = module.get<EnglishService>(EnglishService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('startGame', () => {
    it('should start a vocabulary game for beginners', () => {
      const gameState = service.startGame('room1', 'vocabulary', 'beginner', ['player1', 'player2']);
      
      expect(gameState.roomId).toBe('room1');
      expect(gameState.gameType).toBe('vocabulary');
      expect(gameState.level).toBe('beginner');
      expect(gameState.gameStatus).toBe('waiting');
      expect(Object.keys(gameState.players)).toHaveLength(2);
      expect(gameState.questions.length).toBeGreaterThan(0);
    });

    it('should start a mixed game for intermediate level', () => {
      const gameState = service.startGame('room2', 'mixed', 'intermediate', ['player1']);
      
      expect(gameState.gameType).toBe('mixed');
      expect(gameState.level).toBe('intermediate');
      expect(gameState.questions.length).toBeGreaterThan(0);
    });

    it('should throw error for unsupported game type', () => {
      expect(() => {
        service.startGame('room1', 'invalid' as any, 'beginner', ['player1']);
      }).toThrow(BadRequestException);
    });
  });

  describe('startRound', () => {
    beforeEach(() => {
      service.startGame('room1', 'vocabulary', 'beginner', ['player1']);
    });

    it('should start a round successfully', () => {
      const gameState = service.startRound('room1');
      
      expect(gameState.gameStatus).toBe('playing');
      expect(gameState.currentRound).toBe(1);
    });

    it('should throw error for non-existent game', () => {
      expect(() => {
        service.startRound('non-existent-room');
      }).toThrow(BadRequestException);
    });
  });

  describe('submitAnswer', () => {
    beforeEach(() => {
      service.startGame('room1', 'vocabulary', 'beginner', ['player1']);
      service.startRound('room1');
    });

    it('should accept correct answer and award points', () => {
      const gameState = service.getState('room1');
      const question = gameState?.questions[0];
      
      if (question) {
        const result = service.submitAnswer('room1', 'player1', question.id, question.correctAnswer);
        expect(result.players['player1'].score).toBeGreaterThan(0);
      }
    });

   

    it('should throw error for non-existent player', () => {
      expect(() => {
        service.submitAnswer('room1', 'non-existent-player', 'question1', 'answer');
      }).toThrow(BadRequestException);
    });
  });

  describe('getState', () => {
    it('should return null for non-existent game', () => {
      const state = service.getState('non-existent-room');
      expect(state).toBeNull();
    });

    it('should return game state for existing game', () => {
      service.startGame('room1', 'vocabulary', 'beginner', ['player1']);
      const state = service.getState('room1');
      expect(state).toBeDefined();
      expect(state?.roomId).toBe('room1');
    });
  });

  describe('endGame', () => {
    beforeEach(() => {
      service.startGame('room1', 'vocabulary', 'beginner', ['player1', 'player2']);
    });

    it('should end game and return winner', () => {
      const result = service.endGame('room1');
      
      expect(result.winner).toBeDefined();
      expect(result.finalScores).toBeDefined();
      expect(Object.keys(result.finalScores)).toHaveLength(2);
    });

    it('should throw error for non-existent game', () => {
      expect(() => {
        service.endGame('non-existent-room');
      }).toThrow(BadRequestException);
    });
  });

  describe('getLeaderboard', () => {
    beforeEach(() => {
      service.startGame('room1', 'vocabulary', 'beginner', ['player1', 'player2']);
    });

    it('should return leaderboard for game', () => {
      const leaderboard = service.getLeaderboard('room1');
      
      expect(leaderboard).toBeDefined();
      expect(leaderboard.length).toBe(2);
      expect(leaderboard[0]).toHaveProperty('playerId');
      expect(leaderboard[0]).toHaveProperty('score');
      expect(leaderboard[0]).toHaveProperty('rank');
    });

    it('should throw error for non-existent game', () => {
      expect(() => {
        service.getLeaderboard('non-existent-room');
      }).toThrow(BadRequestException);
    });
  });

  describe('getGameOptions', () => {
    it('should return available game types and levels', () => {
      const options = service.getGameOptions();
      
      expect(options.types).toContain('vocabulary');
      expect(options.types).toContain('grammar');
      expect(options.types).toContain('reading');
      expect(options.types).toContain('listening');
      expect(options.types).toContain('writing');
      expect(options.types).toContain('mixed');
      expect(options.levels).toContain('beginner');
      expect(options.levels).toContain('intermediate');
      expect(options.levels).toContain('advanced');
      expect(options.questionCounts).toBeDefined();
    });
  });
});
