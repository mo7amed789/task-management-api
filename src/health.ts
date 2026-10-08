import {Controller,Get,ServiceUnavailableException} from '@nestjs/common';
import {PrismaService} from './prisma.service';
@Controller('health') export class HealthController { constructor(private db:PrismaService){} @Get() async check(){try{await this.db.$queryRaw`SELECT 1`;return {status:'ok',database:'ok',timestamp:new Date().toISOString()};}catch{throw new ServiceUnavailableException({status:'error',database:'unavailable'});}} }
