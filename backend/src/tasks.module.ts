import { Module } from '@nestjs/common';
import { TasksService } from './tasks/tasks.service';
import { TasksController } from './tasks/tasks.controller';

@Module({
  controllers: [TasksController],
  providers: [TasksService]
})
export class TasksModule {}
