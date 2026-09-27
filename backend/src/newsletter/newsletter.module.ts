import { Body, ConflictException, Controller, Injectable, Module, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { IsEmail, MaxLength } from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';

class SubscribeDto { @IsEmail() @MaxLength(254) email: string; }
@Injectable()
class NewsletterService {
  constructor(private prisma: PrismaService) {}
  async subscribe(email: string) {
    try { await this.prisma.newsletterSubscriber.create({ data: { email: email.trim().toLowerCase() } }); }
    catch { throw new ConflictException('This email is already subscribed'); }
    return { success: true };
  }
}
@ApiTags('newsletter') @Controller('newsletter')
class NewsletterController {
  constructor(private service: NewsletterService) {}
  @Post('subscribe') subscribe(@Body() body: SubscribeDto) { return this.service.subscribe(body.email); }
}
@Module({ controllers: [NewsletterController], providers: [NewsletterService] })
export class NewsletterModule {}
