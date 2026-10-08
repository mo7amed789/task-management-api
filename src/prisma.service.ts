import {Injectable,Logger,OnModuleDestroy,OnModuleInit} from '@nestjs/common';
import {PrismaClient} from '@prisma/client';
@Injectable() export class PrismaService extends PrismaClient implements OnModuleInit,OnModuleDestroy {
 private readonly log=new Logger(PrismaService.name);
 constructor(){
  const configured=process.env.DATABASE_URL;
  const url=configured&&/[?&]sslmode=/i.test(configured)
   ? configured
   : configured?`${configured}${configured.includes('?')?'&':'?'}sslmode=require`:configured;
  super(url?{datasources:{db:{url}}}:undefined);
 }
 async onModuleInit(){for(let attempt=1;attempt<=5;attempt++){try{await this.$connect();this.log.log('Database connection established.');return}catch(error){this.log.warn(`Database connection attempt ${attempt}/5 failed; retrying shortly.`);if(attempt===5){this.log.error('Database is unavailable. The API will remain online and retry on demand.',error instanceof Error?error.stack:undefined);return}await new Promise(resolve=>setTimeout(resolve,2000*attempt))}}}
 async onModuleDestroy(){await this.$disconnect()}
}
