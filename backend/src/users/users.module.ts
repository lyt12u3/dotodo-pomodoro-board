import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
// PrismaModule will be imported globally or where needed, not directly here typically if UsersService depends on PrismaService provided elsewhere
// However, if UsersService needs PrismaService from a Users-specific Prisma module instance, that's different.
// Assuming PrismaService is globally available or provided by a root PrismaModule.

@Module({
  controllers: [UsersController],
  providers: [UsersService], // PrismaService will be available if PrismaModule is imported in AppModule
  exports: [UsersService]
})
export class UsersModule {} 