# meditation-app

A modern meditation app built with Next.js, featuring AI-powered meditation generation, user authentication, and subscription management.

## Features

- 🧘‍♂️ AI-powered meditation generation
- 🔒 Secure authentication system
- 💳 Subscription-based access
- 🎨 Beautiful, responsive UI
- 🌙 Dark mode design
- ✨ Smooth animations

## Tech Stack

- Next.js 13+ with App Router
- TypeScript
- Tailwind CSS
- Supabase Auth
- Framer Motion
- Shadcn/ui Components

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
/app
  ├── /auth
  ├── /dashboard
  ├── /meditation-generator
  └── /pricing
/components
  ├── /ui
  └── AuthForm.tsx
/contexts
  └── AuthContext.tsx
```

## License

MIT

## Environment Setup

1. Copy `.env.example` to `.env.local`
2. Fill in your API keys:
   - Supabase credentials
   - OpenAI API key
   - Stripe keys
   - Unsplash access key

⚠️ Never commit your actual `.env.local` file or API keys to GitHub!
