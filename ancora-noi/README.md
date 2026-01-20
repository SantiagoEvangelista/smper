# Ancora Noi CRM

A modern CRM built with React, TypeScript, Tailwind CSS, and Supabase.

## Features

- **Dashboard** - Overview of your business with KPIs
- **Contacts** - Manage your contacts and leads
- **Companies** - Track companies and organizations
- **Deals** - Sales pipeline management
- **Projects** - Project tracking with tasks

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth)
- **State Management**: Zustand
- **Routing**: React Router v6
- **Icons**: Lucide React
- **Deployment**: GitHub Pages

## Getting Started

### 1. Create a Supabase Project

1. Go to [Supabase](https://supabase.com) and create a new project
2. Go to the SQL Editor and run the contents of `supabase-schema.sql`
3. Go to Settings > API and copy your project URL and anon key

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Run Locally

```bash
npm install
npm run dev
```

### 4. Deploy to GitHub Pages

1. Push your code to a GitHub repository
2. Go to repository Settings > Pages
3. Select the `gh-pages` branch and `/ (root)` folder
4. Add your Supabase credentials as GitHub secrets:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
5. Push to main branch - GitHub Actions will automatically deploy

## Project Structure

```
src/
├── components/
│   ├── auth/          # Authentication components
│   ├── layout/        # App layout (sidebar, header)
│   └── ui/            # Reusable UI components
├── hooks/             # Custom React hooks
├── lib/               # Utility functions and Supabase client
├── pages/             # Page components
├── store/             # Zustand state stores
├── types/             # TypeScript types
└── App.tsx            # Main app component
```

## License

MIT
