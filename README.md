# AI Blog Generator with Gemini

A modern, full-stack AI-powered blog generation platform built with Next.js, TypeScript, Prisma, and Google's Gemini AI.

## 🚀 Features

- **AI-Powered Content Generation**: Create high-quality blog posts using Google's Gemini AI
- **User Authentication**: Secure login/signup with JWT tokens
- **Draft Management**: Save, edit, and manage drafts before publishing
- **Collections**: Organize your posts into custom collections
- **Responsive Design**: Modern UI built with Tailwind CSS and Radix UI
- **Database Integration**: MongoDB with Prisma ORM
- **Email Integration**: Welcome emails and notifications with Resend

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS, Radix UI
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: MongoDB
- **AI**: Google Gemini AI
- **Authentication**: JWT with Jose
- **Email**: Resend API
- **Deployment**: Vercel

## 🚀 Quick Start

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/MirazShawon/Ai_Blog_Generator-Gemini-.git
cd Ai_Blog_Generator-Gemini-
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your actual values:
```env
DATABASE_URL=your_mongodb_connection_string
RESEND_API_KEY=your_resend_api_key
JWT_SECRET=your_jwt_secret_key
GOOGLE_AI_API_KEY=your_google_ai_api_key
NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY=your_google_ai_api_key
NODE_ENV=development
```

4. Generate Prisma client:
```bash
npx prisma generate
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 🚀 Vercel Deployment

### 1. Deploy to Vercel
1. Push your code to GitHub
2. Import your repository to Vercel
3. Set up environment variables in Vercel dashboard

### 2. Environment Variables for Production
Set these in your Vercel project settings:

```env
DATABASE_URL=your_mongodb_connection_string
RESEND_API_KEY=your_resend_api_key  
JWT_SECRET=your_jwt_secret_key
GOOGLE_AI_API_KEY=your_google_ai_api_key
NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY=your_google_ai_api_key
NODE_ENV=production
```

### 3. Database Setup
- Ensure your MongoDB database is accessible from Vercel
- Consider using MongoDB Atlas for cloud hosting

## 📁 Project Structure

```
├── app/                   # Next.js App Router
│   ├── api/              # API routes
│   ├── components/       # React components
│   └── pages/           # Application pages
├── components/           # Reusable UI components
├── lib/                 # Utility functions
├── prisma/              # Database schema and migrations
└── public/              # Static assets
```

## 🔧 Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run tests
- `npx prisma generate` - Generate Prisma client
- `npx prisma studio` - Open Prisma Studio

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Google Gemini AI](https://ai.google.dev/) - AI content generation
- [Prisma](https://prisma.io/) - Database toolkit
- [Vercel](https://vercel.com/) - Deployment platform

---

Built with ❤️ by [MirazShawon](https://github.com/MirazShawon)
