import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();
async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const name = process.env.ADMIN_NAME?.trim();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !name || !password || password.length < 12) throw new Error('Set ADMIN_EMAIL, ADMIN_NAME, and ADMIN_PASSWORD (at least 12 characters) in the environment.');
  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.upsert({ where: { email }, update: { name, passwordHash, role: 'admin', tokenVersion: { increment: 1 } }, create: { email, name, passwordHash, role: 'admin' } });
  console.log(`Admin account configured: ${email}`);
}
main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
