import {Injectable,Logger,OnModuleDestroy,OnModuleInit} from '@nestjs/common';
import {PrismaClient} from '@prisma/client';
@Injectable() export class PrismaService extends PrismaClient implements OnModuleInit,OnModuleDestroy {
 private readonly log=new Logger(PrismaService.name);
 constructor(){
  const configured=process.env.DATABASE_URL;
  let url=configured;
  if(url){
   url=/[?&]sslmode=/i.test(url)?url.replace(/([?&])sslmode=[^&]*/i,'$1sslmode=verify-full'):`${url}${url.includes('?')?'&':'?'}sslmode=verify-full`;
   if(!/[?&]sslcert=/i.test(url)) url+='&sslcert=./prisma/botkeep-ca.pem';
  }
  super(url?{datasources:{db:{url}}}:undefined);
 }
 async onModuleInit(){void this.connectWithRetry();}
 private async connectWithRetry(){for(let attempt=1;attempt<=5;attempt++){try{await this.$connect();this.log.log('Database connection established.');return}catch(error){this.log.warn(`Database connection attempt ${attempt}/5 failed; retrying shortly.`);if(attempt===5){this.log.error('Database is unavailable. The API will remain online and retry on demand.',error instanceof Error?error.stack:undefined);return}await new Promise(resolve=>setTimeout(resolve,2000*attempt))}}}
 async onModuleDestroy(){await this.$disconnect()}
}
