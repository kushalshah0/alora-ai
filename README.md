<div align="center">
  <h1>🤖 Alora AI</h1>
  <p>A modern, responsive AI chat application built with React, TypeScript, and Tailwind CSS</p>
  
  <p>
    <img src="https://img.shields.io/badge/React-18.3.1-blue?style=for-the-badge&logo=react" alt="React" />
    <img src="https://img.shields.io/badge/TypeScript-5.6.3-blue?style=for-the-badge&logo=typescript" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-3.4.15-blue?style=for-the-badge&logo=tailwindcss" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/Vite-6.0.1-646CFF?style=for-the-badge&logo=vite" alt="Vite" />
  </p>
</div>

## ✨ Features

- 🎯 **Multiple AI Providers** - Support for OpenRouter, OpenAI, and custom providers
- 💬 **Real-time Streaming** - Live response streaming for natural conversation flow
- 📱 **Responsive Design** - Optimized for desktop, tablet, and mobile devices
- 🎨 **Modern UI/UX** - Clean, intuitive interface with smooth animations
- 💾 **Conversation Management** - Create, rename, delete, and organize chat conversations
- 📋 **Copy Functionality** - Easy copy-to-clipboard for messages and code blocks
- 🔧 **Model Selection** - Switch between different AI models on the fly
- ⚡ **Performance Optimized** - Built with modern React patterns and optimizations
- 🎯 **Error Handling** - Comprehensive error handling with helpful user messages
- 🖥️ **Code Highlighting** - Syntax highlighting for code blocks with copy functionality

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/alora-ai.git
   cd alora-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Setup**
   
   Create a `.env` file in the root directory:
   ```env
   VITE_APP_NAME="Alora AI"
   VITE_OPENROUTER_API_KEY=your_openrouter_api_key_here
   # Optional: Add other provider keys
   VITE_OPENAI_API_KEY=your_openai_api_key_here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   
   Navigate to `http://localhost:5173` to start chatting!

## 🏗️ Project Structure

```
src/
├── components/          # React components
│   ├── chat/           # Chat-related components
│   │   ├── ChatInterface.tsx
│   │   ├── ConversationSidebar.tsx
│   │   ├── MessageList.tsx
│   │   ├── MessageInput.tsx
│   │   └── ModelDropdown.tsx
│   ├── layout/         # Layout components
│   │   ├── Header.tsx
│   │   ├── Layout.tsx
│   │   └── MobileSidebar.tsx
│   └── ui/             # Reusable UI components
│       ├── Button.tsx
│       ├── Input.tsx
│       └── Modal.tsx
├── context/            # React context providers
│   ├── ChatContext.tsx
│   ├── UIContext.tsx
│   └── UserContext.tsx
├── hooks/              # Custom React hooks
│   ├── useAI.ts
│   ├── useChat.ts
│   └── useLocalStorage.ts
├── services/           # API and external services
│   └── aiProviders.ts
├── utils/              # Utility functions
│   ├── constants.ts
│   ├── formatters.ts
│   └── helpers.ts
└── styles/             # Global styles
    └── index.css
```

## 🎛️ Configuration

### AI Providers

The app supports multiple AI providers. Configure them in your `.env` file:

| Provider | Environment Variable | Models Available |
|----------|---------------------|------------------|
| OpenRouter | `VITE_OPENROUTER_API_KEY` | GPT-4, Claude, Llama, and more |
| OpenAI | `VITE_OPENAI_API_KEY` | GPT-4, GPT-3.5-turbo |
| CloseRouter | `VITE_CLOSEROUTER_API_KEY` | Custom models |

### Customization

- **Themes**: Light mode optimized (dark mode removed for cleaner design)
- **Models**: Configure default models in `src/utils/constants.ts`
- **Styling**: Customize colors and styles in `tailwind.config.js`

## 🧰 Tech Stack

### Core Technologies
- **React 18** - Modern React with hooks and concurrent features
- **TypeScript** - Type-safe development experience  
- **Tailwind CSS** - Utility-first CSS framework
- **Vite** - Fast build tool and development server

### Key Libraries
- **React Markdown** - Markdown rendering with syntax highlighting
- **Lucide React** - Beautiful, customizable icons
- **Date-fns** - Modern JavaScript date utility library
- **UUID** - Unique identifier generation

### Development Tools
- **ESLint** - Code linting and quality
- **PostCSS** - CSS processing and optimization
- **Autoprefixer** - CSS vendor prefix automation

## 📱 Features Showcase

### 💬 Chat Interface
- **Streaming Responses**: Real-time message streaming
- **Message Management**: Copy, edit, and organize conversations
- **Code Highlighting**: Automatic syntax highlighting for code blocks
- **Mobile Optimized**: Responsive design for all screen sizes

### 🎯 Error Handling
- **Smart Error Detection**: Context-aware error messages
- **Recovery Suggestions**: Helpful tips for resolving issues
- **Graceful Failures**: Clean error states without breaking the UI

### 🔧 Conversation Management
- **Auto-naming**: Conversations auto-named from first message
- **Quick Actions**: Rename, delete, and organize chats
- **Persistent Storage**: Conversations saved locally
- **Search & Filter**: Find conversations quickly

## 🚀 Deployment

### Build for Production

```bash
npm run build
# or 
yarn build
```

### Preview Production Build

```bash
npm run preview
# or
yarn preview
```

### Deploy Options

The app can be deployed to any static hosting service:

- **Vercel**: Deploy with zero configuration
- **Netlify**: Automatic deployments from Git
- **GitHub Pages**: Free hosting for public repositories
- **AWS S3 + CloudFront**: Scalable cloud hosting

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use semantic commit messages
- Add tests for new features
- Update documentation as needed
- Follow the existing code style

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenRouter for providing access to multiple AI models
- The React and TypeScript communities
- Tailwind CSS for the amazing utility framework
- All contributors and users of this project

---

<div align="center">
  <p>Made with ❤️ by <a href="https://github.com/yourusername">Your Name</a></p>
  <p>
    <a href="#top">🔝 Back to top</a>
  </p>
</div>
