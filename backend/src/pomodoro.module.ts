import { Module } from '@nestjs/common';
import { PomodoroService } from './pomodoro/pomodoro.service';
import { PomodoroController } from './pomodoro/pomodoro.controller';

@Module({
  controllers: [PomodoroController],
  providers: [PomodoroService]
})
export class PomodoroModule {}
