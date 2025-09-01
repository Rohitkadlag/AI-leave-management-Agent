# Leave Management System - Frontend

A modern, AI-powered leave management system built with React, Vite, and Tailwind CSS, optimized for Bun.

## 🚀 Features

- ⚡️ **Bun Runtime** - Ultra-fast JavaScript runtime and package manager
- 🤖 **AI-Powered** - Intelligent leave analysis with DeepSeek integration  
- 📱 **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- 🔐 **Role-Based Access** - Employee, Manager, and Admin views
- 🎨 **Modern UI** - Beautiful interface with Tailwind CSS
- 🔄 **Real-time Updates** - Live notifications and status updates

## 📋 Prerequisites

- **Bun** v1.0.0 or higher
- **Node.js** 18+ (for compatibility)
- **Backend API** running on http://localhost:4000

## 🛠️ Setup & Installation

```bash
# Install dependencies with Bun
bun install

# Start development server
bun run dev

# Build for production
bun run build

# Preview production build
bun run preview
```

## 🌍 Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:4000/api
VITE_APP_NAME=Leave Management System
VITE_APP_VERSION=1.0.0
```

## 📱 Demo Credentials

The application includes built-in demo credentials:

- **Admin:** admin@demo.io / Admin@1234
- **Manager:** manager@demo.io / Manager@1234  
- **Employee:** employee@demo.io / Employee@1234

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── common/         # Common components (Header, Sidebar, etc.)
│   ├── auth/           # Authentication components
│   ├── leaves/         # Leave management components  
│   ├── dashboard/      # Dashboard components
│   └── ai/             # AI-related components
├── pages/              # Page components
├── hooks/              # Custom React hooks
├── services/           # API service layers
├── contexts/           # React contexts
├── utils/              # Utility functions
└── App.jsx             # Main application component
```

## 🤖 AI Features

- **Smart Leave Analysis** - AI categorizes and analyzes leave requests
- **Intelligent Recommendations** - AI suggests approval/rejection decisions
- **Chat Assistant** - Ask questions about leave policies
- **Pattern Recognition** - AI detects leave patterns and trends

## 🎨 Styling

This project uses **Tailwind CSS** for styling with a custom design system:

- **Primary Colors** - Blue gradient theme
- **Responsive Breakpoints** - Mobile-first approach
- **Custom Components** - Reusable UI patterns
- **Dark Mode Ready** - Easy theme switching

## 📦 Available Scripts

- `bun run dev` - Start development server
- `bun run build` - Build for production
- `bun run preview` - Preview production build
- `bun run lint` - Run ESLint

## 🔗 Backend Integration

The frontend integrates with the Leave Management API:

- **Authentication** - JWT-based auth with role management
- **Leave Operations** - CRUD operations for leave requests
- **AI Services** - DeepSeek integration for intelligent features
- **Real-time Updates** - WebSocket support for live updates

## 📄 License

MIT License - see LICENSE file for details.
