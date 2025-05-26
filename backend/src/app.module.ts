import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth.module';
import { UsersModule } from './users.module';
import { TasksModule } from './tasks.module';
import { PomodoroModule } from './pomodoro.module';
import { PrismaModule } from './prisma.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    TasksModule,
    PomodoroModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
