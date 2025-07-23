import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';

interface Card {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  value: number; // 2-14 (where 14 = Ace)
}

interface WarGameState {
  roomId: string;
  players: { [playerId: string]: Card[] };
  pile: { playerId: string; card: Card }[];
  status: 'ongoing' | 'finished';
  winner?: string;
}

@Injectable()
export class WarService {
  private gameStates: Map<string, WarGameState> = new Map();

  // ✅ Create and shuffle deck
  private createDeck(): Card[] {
    const suits = ['hearts', 'diamonds', 'clubs', 'spades'] as const;
    const cards: Card[] = [];

    for (const suit of suits) {
      for (let value = 2; value <= 14; value++) {
        cards.push({ suit, value });
      }
    }

    // Shuffle deck
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }

    return cards;
  }

  // ✅ Start game
  startGame(roomId: string, players: string[] = []): any {
    if (players.length !== 2) {
      throw new BadRequestException('War game requires exactly 2 players');
    }
    if (this.gameStates.has(roomId)) {
      throw new BadRequestException(`Game already started in room ${roomId}`);
    }
    const deck = this.createDeck();
    const half = Math.floor(deck.length / 2);

    const gameState: WarGameState = {
      roomId,
      players: {
        [players[0]]: deck.slice(0, half),
        [players[1]]: deck.slice(half),
      },
      pile: [],
      status: 'ongoing',
    };
    console.log(`Game state initialized for room ${roomId}`, gameState);

    this.gameStates.set(roomId, gameState);
    console.log(`Game started in room ${roomId} with players: ${players.join(', ')}`);
    return {
      message: `Game started in room ${roomId}`,
      players,
      cardsPerPlayer: half,
    };
  }

  // ✅ Play turn
  playTurn(roomId: string, playerId: string) {
    const gameState = this.gameStates.get(roomId);
    if (!gameState) throw new NotFoundException(`No game found in room ${roomId}`);
    if (gameState.status === 'finished') throw new BadRequestException('Game is already finished');

    const playerCards = gameState.players[playerId];
    if (!playerCards || playerCards.length === 0) {
      return { message: `Player ${playerId} has no cards left` };
    }

    const card = playerCards.shift(); // Remove top card
    if (!card) {
      return { message: `Player ${playerId} has no cards left` };
    }
    gameState.pile.push({ playerId, card });

    // When both players have played
    const playersInPile = new Set(gameState.pile.map((p) => p.playerId));
    if (playersInPile.size === 2 && gameState.pile.length % 2 === 0) {
      const lastTwo = gameState.pile.slice(-2);
      const [c1, c2] = lastTwo;

      if (c1.card.value > c2.card.value) {
        gameState.players[c1.playerId].push(...gameState.pile.map(p => p.card));
        gameState.pile = [];
        return { message: `${c1.playerId} wins this battle!`, status: 'ongoing' };
      } else if (c2.card.value > c1.card.value) {
        gameState.players[c2.playerId].push(...gameState.pile.map(p => p.card));
        gameState.pile = [];
        return { message: `${c2.playerId} wins this battle!`, status: 'ongoing' };
      } else {
        return { message: 'War! Tie occurred. Each player must play again.', pile: gameState.pile };
      }
    }


    // Check winner
    const [p1, p2] = Object.keys(gameState.players);
    if (gameState.players[p1].length === 0 || gameState.players[p2].length === 0) {
      gameState.status = 'finished';
      gameState.winner =
        gameState.players[p1].length > gameState.players[p2].length ? p1 : p2;
    }

    return { message: `Player ${playerId} played a card`, pile: gameState.pile, status: gameState.status };
  }

  // ✅ Get game state
  getState(roomId: string) {
    const gameState = this.gameStates.get(roomId);
    if (!gameState) throw new NotFoundException(`No game found in room ${roomId}`);

    const lastCards: Record<string, Card[]> = {};
    gameState.pile.forEach(entry => {
      if (!lastCards[entry.playerId]) {
        lastCards[entry.playerId] = [];
      }
      lastCards[entry.playerId].push(entry.card);
    });

    return {
      status: gameState.status,
      players: Object.fromEntries(
        Object.entries(gameState.players).map(([id, cards]) => [id, cards.length])
      ),
      pile: gameState.pile,
      lastCards,
      winner: gameState.winner || null,
    };
  }

  // ✅ End game manually
  endGame(roomId: string) {
    const gameState = this.gameStates.get(roomId);
    if (!gameState) throw new NotFoundException(`No game found in room ${roomId}`);

    gameState.status = 'finished';
    this.gameStates.delete(roomId);

    return { message: `Game ended in room ${roomId}` };
  }
}
