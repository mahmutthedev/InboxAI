# InboxAI

> **Warning**
> This template is deprecated. You can now create a new Next.js project using the shadcn CLI: `npx shadcn init`.

A Next.js 13 template for building apps with Radix UI and Tailwind CSS.

## Usage

```bash
npx create-next-app -e https://github.com/Mahmutthedev/InboxAI
```

## Features

- Next.js 13 App Directory
- Radix UI Primitives
- Tailwind CSS
- Icons from [Lucide](https://lucide.dev)
- Dark mode with `next-themes`
- Tailwind CSS class sorting, merging and linting.

## Google OAuth Setup

- Enable the Gmail API and OAuth consent screen in the [Google Cloud Console](https://console.cloud.google.com/).
- Create OAuth 2.0 credentials and add `http://localhost:3000/api/auth/callback/google` to the authorized redirect URIs.
- Copy the credentials into `.env` using the keys defined in `.env.example`.
- Set `NEXTAUTH_SECRET` to a secure random string (e.g. `openssl rand -hex 32`).
- Restart the dev server so NextAuth picks up the new environment variables.

## License

Licensed under the [MIT license](https://github.com/shadcn/ui/blob/main/LICENSE.md).

