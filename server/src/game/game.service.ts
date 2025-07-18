import { Injectable, BadRequestException } from '@nestjs/common';
import { WarService } from './war/war.service';
import { EratzIrService } from './eratzIr/eratzIr.service';

@Injectable()
export class GameService {
  constructor(
    private readonly warService: WarService,
    private readonly eratzIrService: EratzIrService,
  ) {}

  /** ✅ פונקציה כללית שמופעלת מה-Gateway */
  handleAction(roomId: string, body: { gameType: string; action: string; payload?: any }) {
    const { gameType, action, payload } = body;

    let state;
    switch (gameType) {
      case 'war':
        state = this.handleWarAction(roomId, action, payload);
        break;
      case 'eratz-ir':
        state = this.handleEratzIrAction(roomId, action, payload);
        break;
      default:
        throw new BadRequestException(`Unsupported game type: ${gameType}`);
    }

    // ✅ בכל מקרה, נחזיר את המצב המעודכן לשידור
    return state;
  }

  /** ✅ לוגיקת מלחמה */
  private handleWarAction(roomId: string, action: string, payload: any) {
    switch (action) {
      case 'start':
        if (!payload || !payload.players || payload.players.length !== 2) {
          throw new BadRequestException('War game requires exactly 2 players');
        }
        this.warService.startGame(roomId, payload.players);
        return this.warService.getState(roomId);

      case 'play':
        this.warService.playTurn(roomId, payload.playerId);
        return this.warService.getState(roomId);

      case 'state':
        return this.warService.getState(roomId);

      case 'end':
        this.warService.endGame(roomId);
        return { message: 'Game ended', roomId };

      default:
        throw new BadRequestException(`Unsupported action: ${action}`);
    }
  }

  /** ✅ לוגיקת ארץ עיר */
  private handleEratzIrAction(roomId: string, action: string, payload: any) {
    switch (action) {
      case 'start':
        this.eratzIrService.startGame(roomId, payload.categories);
        return this.eratzIrService.getState(roomId);

      case 'save': // אם אתה תומך בשמירה חלקית
        this.eratzIrService.saveAnswers(roomId, payload.playerId, payload.answers);
        return this.eratzIrService.getState(roomId);

      case 'submitAll': // סוף משחק
        this.eratzIrService.submitAll(roomId);
        return this.eratzIrService.getState(roomId);

      case 'state':
        return this.eratzIrService.getState(roomId);

      case 'end':
        this.eratzIrService.endGame(roomId);
        return { message: 'Game ended', roomId };

      default:
        throw new BadRequestException(`Unsupported action: ${action}`);
    }
  }
}
