# HopeNet

HopeNet — a community-powered platform that helps families and organizations locate missing loved ones after natural disasters. When storms disrupt electricity, cell, and internet services, HopeNet provides a resilient communication channel for submitting search requests and sharing verified updates from trusted response teams.

## Tech Stack

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Material UI (MUI)** - React component library
- **Tailwind CSS** - Utility-first CSS framework
- **Emotion** - CSS-in-JS library (used by MUI)
- **Supabase** - Backend as a Service (planned integration)
- **ESLint** - Code linting
- **Prettier** - Code formatting

## Features

- ✅ Modern Next.js App Router architecture
- ✅ TypeScript for type safety
- ✅ Material UI components with custom theme
- ✅ Tailwind CSS for utility styling
- ✅ Dark/Light mode toggle
- ✅ Responsive navigation (mobile & desktop)
- ✅ Clean layout with header and footer
- ✅ ESLint and Prettier configured
- ✅ Supabase client setup (requires configuration)

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/cdopeter/find-love-ones.git
cd find-love-ones
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

## Project Structure

```
find-love-ones/
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── layout.tsx    # Root layout
│   │   ├── page.tsx      # Home page
│   │   └── globals.css   # Global styles
│   ├── components/       # React components
│   │   ├── ThemeProvider.tsx  # MUI theme & dark mode
│   │   ├── Navigation.tsx     # Header navigation
│   │   ├── Footer.tsx         # Footer component
│   │   └── Layout.tsx         # Main layout wrapper
│   └── lib/              # Utilities and configs
│       └── supabase.ts   # Supabase client
├── public/               # Static assets
├── eslint.config.mjs    # ESLint configuration
├── .prettierrc          # Prettier configuration
├── next.config.ts       # Next.js configuration
├── tsconfig.json        # TypeScript configuration
└── package.json         # Dependencies and scripts
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
