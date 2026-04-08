# Tanakayu Web 🏘️

A modern community management platform for neighborhood administration (RW/RT). Built to help community leaders manage announcements, events, financial transparency, and resident communication efficiently.

## 🚀 Features

### 📰 **News & Events Management**

- Create and manage community events
- News announcements with rich text editor
- Event scheduling with start/end dates
- Category-based filtering
- Comment system with moderation

### 📢 **Announcements System**

- Important community notifications
- Categorized announcements (utilities, maintenance, etc.)
- Rich text content support
- Admin moderation capabilities

### 💰 **Financial Transparency**

- Complete transaction tracking
- Income and expense categorization
- Monthly/yearly financial reports
- Transparent community fund management

### 👥 **Team & Contact Management**

- Community leadership directory
- Security team contacts
- Role-based access control
- Admin dashboard for management

### 🔐 **Authentication & Security**

- Secure user authentication via Supabase
- Role-based permissions (Admin/Guest)
- Protected admin routes
- Comment moderation system

## 🛠️ Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI + shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **State Management**: Zustand 5
- **Data Fetching**: TanStack Query (React Query) 5
- **Forms**: React Hook Form + Zod 4 validation
- **Rich Text**: Quill.js (react-quill-new)

## 📋 Prerequisites

- **Node.js**: 20.15 or higher
- **Yarn**: 1.22.22
- **Supabase Account**: For database and authentication

## 🚀 Getting Started

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd tanakayu-web
   ```

2. **Install dependencies**

   ```bash
   yarn install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Database Setup**
   - Set up your Supabase project
   - Run the database migrations (schema available in `/src/database/supabase.ts`)
   - Configure Row Level Security (RLS) policies

5. **Run the development server**

   ```bash
   yarn dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages (login, register)
│   ├── (main)/            # Main application pages (requires auth)
│   └── api/               # API routes (server-side only)
├── components/            # Reusable UI components
│   ├── ui/               # shadcn-style UI primitives
│   ├── post/             # Post/announcement components
│   ├── profile/          # Profile section components
│   └── transaction/      # Transaction dialog components
├── hooks/                # TanStack Query hooks for data fetching
├── store/                # Zustand state management
├── constants/            # Role constants and role group arrays
├── lib/                  # Auth verification, fetch utilities, Zod schemas
├── types/                # Shared TypeScript type definitions
├── plugins/              # Supabase & React Query client configuration
├── utils/                # Formatting, date helpers, transformers
└── database/             # Auto-generated Supabase types
```

## 🗄️ Database Schema

The application uses the following main tables:

- `posts` - Community announcements and events (unified)
- `post_categories` - Category management for posts
- `transactions` - Financial records
- `profiles` - User profiles with role assignments
- `permitted_phones` - Whitelist for member registration

## 🔧 Available Scripts

```bash
yarn dev          # Start development server with Turbopack
yarn build        # Build for production
yarn start        # Start production server
yarn lint         # Run ESLint
```

## 🚀 Deployment

This project is optimized for deployment on Vercel:

1. Connect your repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

Alternatively, you can deploy to any platform that supports Next.js.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is private and intended for community use.

---

**Built with ❤️ for better community management**
