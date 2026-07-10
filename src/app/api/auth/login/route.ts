import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_91appt_key';

export async function POST(req: Request) {
  try {
    const { phone, password } = await req.json();

    if (!phone || !password) {
      return NextResponse.json({ error: 'Phone and password are required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user) {
      return NextResponse.json({ error: 'Invalid phone number or password' }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid phone number or password' }, { status: 401 });
    }

    const token = jwt.sign({ userId: user.id, phone: user.phone, role: user.role }, JWT_SECRET, {
      expiresIn: '7d',
    });

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        phone: user.phone,
        balance: user.balance,
      },
    });
  } catch (error) {
    console.error('Login Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
