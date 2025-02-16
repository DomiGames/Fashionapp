

import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/user";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const { token, password } = await req.json();
  if (!token || !password) return NextResponse.json({ message: "Invalid request" }, { status: 400 });

  try {
    await connectToDatabase();

    const user = await User.findOne({ resetToken: token, resetTokenExpires: { $gte: new Date() } });
    if (!user) return NextResponse.json({ message: "Invalid or expired token" }, { status: 400 });

    const hashedPassword = await bcrypt.hash(password, 10);

    user.set({ password: hashedPassword, resetToken: null, resetTokenExpires: null });
    await user.save();

    return NextResponse.json({ message: "Password reset successful" });
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

