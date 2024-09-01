import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare, hash } from "bcrypt";

const adminUser = {
  id: "admin",
  name: "Besim",
  email: "hbesim40@gmail.com",
  password: "$2b$10$5KkPCUQHqFjtBDOyfUZg/OyL5Ni.Dm5uRd7Mt1xfjuZn4vJviNwr6",
  isAdmin: true,
};

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "admin@example.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials.email || !credentials.password) {
          return null;
        }

        if (credentials.email === adminUser.email) {
          try {
            const isValid = await compare(
              credentials.password,
              adminUser.password
            );
            if (isValid) {
              return {
                id: adminUser.id,
                name: adminUser.name,
                email: adminUser.email,
                isAdmin: adminUser.isAdmin,
              };
            }
          } catch (error) {
            console.error("bcrypt compare error:", error);
            return null;
          }
        }
        return null;
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.isAdmin = user.isAdmin;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (token) {
        session.user.id = token.id;
        session.user.isAdmin = token.isAdmin;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  debug: process.env.NODE_ENV === "development",
  secret: process.env.NEXTAUTH_SECRET,
};
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
