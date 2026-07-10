import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { userId, action, value } = await req.json();
    
    if (!userId || !action) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    let updatedUser;

    switch (action) {
      case "ADD_BALANCE":
        updatedUser = await prisma.user.update({
          where: { id: userId },
          data: { balance: { increment: parseFloat(value) } }
        });
        break;
      case "DEDUCT_BALANCE":
        updatedUser = await prisma.user.update({
          where: { id: userId },
          data: { balance: { decrement: parseFloat(value) } }
        });
        break;
      case "CHANGE_PASSWORD":
        updatedUser = await prisma.user.update({
          where: { id: userId },
          data: { password: value }
        });
        break;
      case "TOGGLE_BLOCK":
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (user) {
          updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { isBlocked: !user.isBlocked }
          });
        }
        break;
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
