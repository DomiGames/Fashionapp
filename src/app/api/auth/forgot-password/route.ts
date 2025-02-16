
import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/user";
import { sendResetEmail } from "@/lib/utils";
import crypto from "crypto";

export async function POST(req: Request) {
  const { email } = await req.json();
  if (!email) return NextResponse.json({ message: "Email is required" }, { status: 400 });

  try {
    await connectToDatabase();

    const user = await User.findOne({ email });
    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 3600000); // Expires in 1 hour

    user.set({ resetToken: token, resetTokenExpires: expires });
    await user.save();

    const resetLink = `${process.env.NEXT_PUBLIC_AUTH_URL}/reset-password?token=${token}`;
    await sendResetEmail(email, resetLink);

    return NextResponse.json({ message: "Password reset link sent!" });
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

