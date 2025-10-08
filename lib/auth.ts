import { JWT } from "next-auth/jwt"
import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"

const GOOGLE_AUTH_SCOPES = [
  "openid",
  "email",
  "profile",
  "https://www.googleapis.com/auth/gmail.readonly",
]

async function refreshGoogleAccessToken(token: JWT) {
  if (!token.refreshToken) {
    throw new Error("Missing refresh token")
  }

  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID ?? "",
    client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    grant_type: "refresh_token",
    refresh_token: token.refreshToken as string,
  })

  const response = await fetch("https://oauth2.googleapis.com/token", {
    body: params,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  })

  const refreshedTokens = (await response.json()) as {
    access_token?: string
    expires_in?: number
    refresh_token?: string
    token_type?: string
    scope?: string
    error?: string
  }

  if (!response.ok) {
    throw new Error(refreshedTokens.error ?? "Failed to refresh access token")
  }

  return {
    ...token,
    accessToken: refreshedTokens.access_token,
    accessTokenExpires: Date.now() + (refreshedTokens.expires_in ?? 0) * 1000,
    refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      authorization: {
        params: {
          scope: GOOGLE_AUTH_SCOPES.join(" "),
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        return {
          ...token,
          accessToken: account.access_token,
          accessTokenExpires: (account.expires_at ?? 0) * 1000,
          refreshToken: account.refresh_token,
        }
      }

      if (token.accessToken && token.accessTokenExpires && Date.now() < token.accessTokenExpires) {
        return token
      }

      try {
        return await refreshGoogleAccessToken(token)
      } catch (error) {
        console.error("Error refreshing access token", error)
        return { ...token, error: "RefreshAccessTokenError" as const }
      }
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.email = session.user.email ?? token.email
      }

      return {
        ...session,
        accessToken: token.accessToken as string | undefined,
        error: token.error,
      }
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
}
