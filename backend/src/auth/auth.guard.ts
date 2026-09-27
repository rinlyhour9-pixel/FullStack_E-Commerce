import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ROLES_KEY } from './auth.decorators';
import { PrismaService } from '../prisma/prisma.service';
import { allowsRole } from '../common/store-rules';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwt: JwtService, private prisma: PrismaService, private reflector: Reflector) {}
  async canActivate(ctx: ExecutionContext) {
    const request = ctx.switchToHttp().getRequest();
    const token = request.headers.authorization?.match(/^Bearer (.+)$/i)?.[1];
    if (!token) throw new UnauthorizedException('Sign in required');
    try {
      const payload = await this.jwt.verifyAsync(token, { secret: process.env.JWT_SECRET });
      const user = await this.prisma.user.findUnique({ where: { id: payload.sub }, select: { id: true, name: true, email: true, role: true, tokenVersion: true } });
      if (!user || user.tokenVersion !== payload.tokenVersion) throw new UnauthorizedException('Invalid session');
      delete (user as any).tokenVersion;
      request.user = user;
    } catch { throw new UnauthorizedException('Invalid or expired session'); }
    const roles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [ctx.getHandler(), ctx.getClass()]);
    if (roles?.length && !allowsRole(request.user.role, roles)) throw new ForbiddenException('Insufficient permissions');
    return true;
  }
}
