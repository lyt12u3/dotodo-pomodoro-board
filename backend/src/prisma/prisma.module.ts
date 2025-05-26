import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service'; // This path is now correct as they are in the same directory

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {} 