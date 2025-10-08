import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { listUserMessages } from "@/lib/gmail"

export default async function IndexPage() {
  const session = await getServerSession(authOptions)
  let messages: Awaited<ReturnType<typeof listUserMessages>> = []
  let errorMessage: string | null = null

  if (!session) {
    return (
      <section className="container grid gap-6 pb-8 pt-6 md:py-10">
        <div className="flex max-w-[700px] flex-col items-start gap-4">
          <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
            Connect your Google account
          </h1>
          <p className="text-lg text-muted-foreground">
            Use the Sign in with Google button in the header to link your Gmail
            inbox and see your latest messages directly on this page.
          </p>
        </div>
        <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
          Once you are signed in, your most recent Gmail emails will appear
          here.
        </div>
      </section>
    )
  }

  if (!session.accessToken) {
    errorMessage =
      session.error === "RefreshAccessTokenError"
        ? "We could not refresh your Google session. Please sign out and sign in again."
        : "Missing Google access token. Try signing out and connecting again."
  } else {
    try {
      messages = await listUserMessages(session.accessToken, 1000)
      console.log(messages)
    } catch (error) {
      console.log(error)
      errorMessage =
        error instanceof Error
          ? error.message
          : "We could not load your Gmail messages. Please try again later."
    }
  }

  return (
    <section className="container flex flex-col gap-6 pb-8 pt-6 md:py-10">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
          {session.user?.name
            ? `${session.user.name}'s Gmail inbox`
            : "Your Gmail inbox"}
        </h1>
        <p className="text-lg text-muted-foreground">
          Showing the latest messages for{" "}
          {session.user?.email ?? "your account"}.
        </p>
      </header>
      {errorMessage ? (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {errorMessage}
        </div>
      ) : messages.length ? (
        <ul className="space-y-4">
          {messages.map((message) => {
            const parsedDate = message.date ? new Date(message.date) : null
            const formattedDate =
              parsedDate && !Number.isNaN(parsedDate.valueOf())
                ? parsedDate.toLocaleString()
                : "Unknown date"

            return (
              <li
                key={message.id}
                className="rounded-lg border bg-card p-4 shadow-sm transition hover:shadow-md"
              >
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    {formattedDate}
                  </p>
                  <h2 className="text-xl font-semibold">{message.subject}</h2>
                  <p className="text-sm text-muted-foreground">
                    From: {message.from}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {message.snippet}
                  </p>
                </div>
              </li>
            )
          })}
        </ul>
      ) : (
        <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
          Your inbox is empty or we could not find any messages to display.
        </div>
      )}
    </section>
  )
}
