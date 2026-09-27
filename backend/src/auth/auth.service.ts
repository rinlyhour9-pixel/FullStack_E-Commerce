import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, RegisterDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}
  private publicUser(user: { id: string; name: string; email: string; role: string }) { return { id: user.id, name: user.name, email: user.email, role: user.role }; }
  private async issue(user: { id: string; name: string; email: string; role: string; tokenVersion: number }) {
    const accessToken = await this.jwt.signAsync({ sub: user.id, role: user.role, tokenVersion: user.tokenVersion }, { secret: process.env.JWT_SECRET, expiresIn: process.env.JWT_EXPIRES_IN ?? '1d' } as any);
    return { accessToken, user: this.publicUser(user) };
  }
  async register(input: RegisterDto) {
    const email = input.email.trim().toLowerCase();
    if (await this.prisma.user.findUnique({ where: { email } })) throw new ConflictException('An account with this email already exists');
    const passwordHash = await bcrypt.hash(input.password, 12);
    const user = await this.prisma.user.create({ data: { name: input.name.trim(), email, passwordHash, role: 'customer', cart: { create: {} } }, select: { id: true, name: true, email: true, role: true, tokenVersion: true } });
    return this.issue(user);
  }
  async login(input: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: input.email.trim().toLowerCase() } });
    if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) throw new UnauthorizedException('Invalid email or password');
    return this.issue(user);
  }
  async logout(userId: string) { await this.prisma.user.update({ where: { id: userId }, data: { tokenVersion: { increment: 1 } } }); return { success: true }; }
}
