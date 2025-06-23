# Truth or Dare Game

A modern, interactive Truth or Dare game built with Next.js 15 and TypeScript. This project provides a fun and engaging platform for playing the classic Truth or Dare game with friends.

## 🚀 Features

- Modern and responsive UI built with Next.js 15 and Tailwind CSS
- Real-time multiplayer functionality using SignalR
- Form validation using React Hook Form and Yup
- State management with Zustand
- API integration with Axios
- Beautiful animations using Framer Motion
- Internationalization support with date-fns
- Error handling with Notistack notifications

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Material-UI
- **State Management**: Zustand
- **Form Handling**: React Hook Form, Yup
- **Real-time Features**: SignalR
- **Animations**: Framer Motion
- **API**: Axios
- **Notifications**: Notistack

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/true-or-dare-production.git
cd true-or-dare-production
```

2. Install dependencies:
```bash
npm install
# or
pnpm install
```

3. Copy `.env.example` to `.env` and configure your environment variables

4. Run the development server:
```bash
npm run dev
# or
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser

## 📦 Building for Production

```bash
npm run build
npm run start
```

## 📝 Project Structure

```
src/
├── app/              # Application routes and pages
├── components/       # Reusable React components
├── hooks/           # Custom React hooks
├── lib/             # Utility functions and shared code
├── types/           # TypeScript type definitions
├── theme/           # Theme configuration
├── utils/           # Utility functions
└── api/             # API integration code
```

## 🔧 Development

- The project uses ESLint for code linting
- TypeScript for type safety
- Tailwind CSS for styling
- Next.js App Router for routing
- React Query for data fetching and caching

## 📚 Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Material-UI Documentation](https://mui.com/material-ui/getting-started/overview/)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.
