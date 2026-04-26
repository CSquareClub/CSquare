import CredentialsProvider from "next-auth/providers/credentials";
import { compare, hash } from "bcrypt";
import prisma from "@/lib/db";
import type { NextAuthOptions } from "next-auth";
import { checkRateLimit, resetRateLimit } from "./rateLimiter";

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "club.csquare@gmail.com").trim().toLowerCase();

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },

      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing credentials");
        }

        const normalizedEmail = credentials.email.trim().toLowerCase();

        if (normalizedEmail !== ADMIN_EMAIL) {
          throw new Error("Invalid email or password");
        }

        const ip =
          (req?.headers?.["x-forwarded-for"] as string)?.split(",")[0] ||
          (req as any)?.socket?.remoteAddress ||
          "unknown";

        // Rate limiting
        checkRateLimit(ip);

        // try {
        //   await prisma.user.create({
        //   data : {
        //     name : "C Square",
        //     email : "club.csquare@gmail.com",
        //     password : await hash("CSqaure@2026", 10)
        //   }
        // })
        // } catch (error) {
        //   console.log(error);
          
        // }

        const user = await prisma.user.findUnique({
          where: { email: normalizedEmail },
        });

        if (!user || !user.password) {
          throw new Error("Invalid email or password");
        }

        const isValid = await compare(credentials.password, user.password);

        if (!isValid) {
          throw new Error("Invalid email or password");
        }

        resetRateLimit(ip);

        return {
          id: user.id?.toString(),
          email: user.email,
          name: user.name
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  pages: {
    signIn: "/admin/login",
  },
   callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },

    async session({ session, token }) {
      // Make id available in session
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};