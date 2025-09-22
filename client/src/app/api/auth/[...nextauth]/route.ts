import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb"; // we'll create this file

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  adapter: MongoDBAdapter(clientPromise),
  secret: process.env.NEXTAUTH_SECRET,
   session: {
    strategy: "jwt", 
    maxAge: 30 * 24 * 60 * 60, 
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, //  30 days
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      // Always redirect to home page after login
      return `${baseUrl}/home`
    },
  },
});
export { handler as GET, handler as POST };
