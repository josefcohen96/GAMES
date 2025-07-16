import { Injectable, BadRequestException } from '@nestjs/common';
import { WarService } from './war/war.service';

@Injectable()
export class GameService {
    constructor(private readonly warService: WarService) { }

    handleAction(roomId: string, body: { gameType: string; action: string; payload?: any }) {
        const { gameType, action, payload } = body;
        switch (gameType) {
            case 'war':
                return this.handleWarAction(roomId, action, payload);
            default:
                throw new BadRequestException(`Unsupported game type: ${gameType}`);
        }
    }

    private handleWarAction(roomId: string, action: string, payload: any) {
        switch (action) {
            case 'start':
                if (!payload || !payload.players || payload.players.length !== 2) {
                    throw new BadRequestException('War game requires exactly 2 players');
                }
                return this.warService.startGame(roomId, payload.players);

            case 'play':
                return this.warService.playTurn(roomId, payload.playerId);
            case 'state':
                return this.warService.getState(roomId);
            case 'end':
                return this.warService.endGame(roomId);
            default:
                throw new BadRequestException(`Unsupported action: ${action}`);
        }
    }
}
