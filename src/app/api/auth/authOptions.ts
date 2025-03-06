// app/api/auth/authOptions.ts
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import connectToDatabase from "@/lib/mongodb";
import User, { IUser } from "@/models/user";

interface NextAuthUser {
  id: string;
  name: string;
  email: string;
  coins: number;
}

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) return null;
        await connectToDatabase();
        const user = (await User.findOne({ email: credentials.email })
          .lean()
          .exec()) as IUser | null;
        if (!user) {
          throw new Error("User not found");
        }
        const isValidPassword = await bcrypt.compare(
          credentials.password,
          user.password as string
        );
        if (!isValidPassword) {
          throw new Error("Invalid password");
        }
        // Convert _id to a string (casting as any if needed)
        const id = (user._id as any).toString();
        return {
          id,
          name: user.name,
          email: user.email!, // non-null assertion since email is required
          coins: user.coins,
        } as NextAuthUser;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email!;
        token.coins = user.coins;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        email: token.email as string,
        name: token.name as string,
        image: token.picture as string,
        coins: token.coins || 0,
      };
      return session;
    },
  },
  pages: { signIn: "/sign-in" },
  secret: process.env.NEXTAUTH_SECRET,
};

