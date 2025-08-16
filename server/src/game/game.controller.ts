import { Controller } from '@nestjs/common';
import { Post, Body, Param } from '@nestjs/common';
import { GameService } from './game.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Post(':roomId/action')
  handleAction(
    @Param('roomId') roomId: string,
    @Body() body: { gameType: string; action: string; payload?: any },
  ) {
    console.log(`Handling action for room ${roomId}:`, body);
    return this.gameService.handleAction(roomId, body);
  }
}
