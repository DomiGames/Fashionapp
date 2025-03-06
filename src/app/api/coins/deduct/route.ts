

// app/api/coins/deduct/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/authOptions";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/user";

export async function POST(_request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  await connectToDatabase();
  const user = await User.findOne({ email: session.user.email });
  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }
  if (user.coins <= 0) {
    return NextResponse.json({ message: "No coins left" }, { status: 400 });
  }
  user.coins = user.coins - 1;
  await user.save();
  return NextResponse.json({ coins: user.coins });
}

