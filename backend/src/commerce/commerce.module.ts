import { Module } from '@nestjs/common';
import { CommerceController } from './commerce.controller';
import { CommerceService } from './commerce.service';
import { AuthModule } from '../auth/auth.module';
@Module({ imports: [AuthModule], controllers: [CommerceController], providers: [CommerceService], exports: [CommerceService] })
export class CommerceModule {}
