import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './auth.dto';
import { AuthGuard } from './auth.guard';
import { CurrentUser } from './auth.decorators';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}
  @Post('register') @Throttle({ default: { limit: 8, ttl: 60_000 } }) register(@Body() body: RegisterDto) { return this.auth.register(body); }
  @Post('login') @Throttle({ default: { limit: 8, ttl: 60_000 } }) login(@Body() body: LoginDto) { return this.auth.login(body); }
  @ApiBearerAuth() @UseGuards(AuthGuard) @Get('me') me(@CurrentUser() user: unknown) { return user; }
  @ApiBearerAuth() @UseGuards(AuthGuard) @Post('logout') logout(@CurrentUser() user: any) { return this.auth.logout(user.id); }
}
