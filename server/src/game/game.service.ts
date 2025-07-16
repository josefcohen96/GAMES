import { Injectable, BadRequestException } from '@nestjs/common';
import { WarService } from './war/war.service';
import { EratzIrService } from './eratzIr/eratzIr.service'; // Assuming EratzIrService is defined and imported


@Injectable()
export class GameService {
    constructor(
        private readonly warService: WarService,
        private readonly eratzIrService: EratzIrService, // Assuming EratzIrService is defined and imported
    ) { }

    handleAction(roomId: string, body: { gameType: string; action: string; payload?: any }) {
        const { gameType, action, payload } = body;
        switch (gameType) {
            case 'war':
                return this.handleWarAction(roomId, action, payload);
            case 'eratz-ir':
                return this.handleEratzIrAction(roomId, action, payload);
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

    private handleEratzIrAction(roomId: string, action: string, payload: any) {
        switch (action) {
            case 'start':
                return this.eratzIrService.startGame(roomId, payload.players, payload.categories);
            case 'play':
                return this.eratzIrService.submitAnswers(roomId, payload.playerId, payload.answers);
            case 'state':
                return this.eratzIrService.getState(roomId);
            case 'end':
                return this.eratzIrService.endGame(roomId);
            default:
                throw new BadRequestException(`Unsupported action: ${action}`);
        }
    }
}
