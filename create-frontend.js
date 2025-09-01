#!/usr/bin/env bun

/**
 * Bun-powered Frontend Setup Script for Leave Management System
 * Creates React frontend with Vite and all required dependencies
 */

import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

const colors = {
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
  reset: '\x1b[0m',
  bright: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function execCommand(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    const process = spawn(command, args, { 
      stdio: 'inherit',
      shell: true,
      ...options 
    });
    
    process.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });
  });
}

async function createReactFrontend() {
  try {
    log('🚀 Creating React Frontend with Bun for Leave Management System...', 'bright');
    log('================================================================', 'yellow');
    
    // Step 1: Create React app with Vite
    log('\n📦 Creating React app with Vite...', 'blue');
    await execCommand('bun', ['create', 'vite@latest', 'leavemgmt-frontend', '--template', 'react']);
    
    // Step 2: Navigate to frontend directory
    process.chdir('leavemgmt-frontend');
    log('📁 Changed to leavemgmt-frontend directory', 'cyan');
    
    // Step 3: Install base dependencies with Bun
    log('\n📦 Installing base dependencies with Bun...', 'blue');
    await execCommand('bun', ['install']);
    
    // Step 4: Install additional dependencies
    log('\n📦 Installing additional packages...', 'blue');
    const packages = [
      'tailwindcss',
      'postcss',
      'autoprefixer',
      '@headlessui/react',
      '@heroicons/react',
      'react-router-dom',
      'axios',
      'react-hook-form',
      '@hookform/resolvers',
      'zod',
      'date-fns',
      'lucide-react',
      'react-hot-toast'
    ];
    
    await execCommand('bun', ['add', ...packages]);
    
    // Step 5: Initialize Tailwind CSS
    log('\n🎨 Setting up Tailwind CSS...', 'blue');
    try {
      // Try with bunx first
      await execCommand('bunx', ['tailwindcss', 'init', '-p']);
    } catch (error) {
      log('  ⚠️  bunx failed, trying with npx...', 'yellow');
      try {
        // Fallback to npx
        await execCommand('npx', ['tailwindcss', 'init', '-p']);
      } catch (npxError) {
        log('  ⚠️  npx failed, creating config files manually...', 'yellow');
        // Create tailwind.config.js manually
        const tailwindConfig = `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s linear infinite',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}`;
        
        const postcssConfig = `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`;

        fs.writeFileSync('tailwind.config.js', tailwindConfig);
        fs.writeFileSync('postcss.config.js', postcssConfig);
        log('  ✓ Created Tailwind config files manually', 'green');
      }
    }
    
    // Step 6: Create directory structure
    log('\n📁 Creating directory structure...', 'blue');
    const directories = [
      'src/components/common',
      'src/components/auth',
      'src/components/leaves',
      'src/components/dashboard',
      'src/components/ai',
      'src/pages',
      'src/hooks',
      'src/services',
      'src/contexts',
      'src/utils'
    ];
    
    directories.forEach(dir => {
      fs.mkdirSync(path.join(process.cwd(), dir), { recursive: true });
      log(`  ✓ Created ${dir}`, 'green');
    });
    
    // Step 7: Create essential files
    log('\n📄 Creating essential configuration files...', 'blue');
    
    // Update package.json with Bun-specific scripts
    const packageJsonPath = 'package.json';
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    packageJson.scripts = {
      ...packageJson.scripts,
      'dev': 'vite',
      'build': 'vite build',
      'preview': 'vite preview',
      'lint': 'eslint . --ext js,jsx --report-unused-disable-directives --max-warnings 0'
    };
    packageJson.description = 'AI-powered Leave Management System Frontend';
    packageJson.keywords = ['react', 'vite', 'tailwind', 'leave-management', 'ai', 'bun'];
    
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    log('  ✓ Updated package.json', 'green');
    
    // Create .env file
    const envContent = `# Frontend Environment Variables
VITE_API_BASE_URL=http://localhost:4000/api
VITE_APP_NAME=Leave Management System
VITE_APP_VERSION=1.0.0
`;
    fs.writeFileSync('.env', envContent);
    log('  ✓ Created .env file', 'green');
    
    // Create .env.example
    const envExampleContent = `# Frontend Environment Variables (Example)
VITE_API_BASE_URL=http://localhost:4000/api
VITE_APP_NAME=Leave Management System
VITE_APP_VERSION=1.0.0
`;
    fs.writeFileSync('.env.example', envExampleContent);
    log('  ✓ Created .env.example file', 'green');
    
    // Update vite.config.js for better Bun compatibility
    const viteConfigContent = `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  },
  define: {
    global: 'globalThis',
  }
})
`;
    fs.writeFileSync('vite.config.js', viteConfigContent);
    log('  ✓ Updated vite.config.js', 'green');
    
    // Update tailwind.config.js with complete configuration (skip if already created above)
    const tailwindConfigPath = 'tailwind.config.js';
    if (!fs.existsSync(tailwindConfigPath)) {
      const tailwindConfigContent = `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s linear infinite',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
`;
      fs.writeFileSync(tailwindConfigPath, tailwindConfigContent);
      log('  ✓ Updated tailwind.config.js', 'green');
    } else {
      log('  ✓ Tailwind config already exists', 'green');
    }
    
    // Create empty files for components
    const componentFiles = [
      'src/components/common/Header.jsx',
      'src/components/common/Sidebar.jsx', 
      'src/components/common/LoadingSpinner.jsx',
      'src/components/common/Modal.jsx',
      'src/components/common/ProtectedRoute.jsx',
      'src/components/auth/LoginForm.jsx',
      'src/components/auth/RegisterForm.jsx',
      'src/components/leaves/LeaveList.jsx',
      'src/components/leaves/LeaveCard.jsx',
      'src/components/leaves/CreateLeaveForm.jsx',
      'src/components/leaves/LeaveDetails.jsx',
      'src/components/leaves/AIInsights.jsx',
      'src/components/dashboard/EmployeeDashboard.jsx',
      'src/components/dashboard/ManagerDashboard.jsx',
      'src/components/dashboard/AdminDashboard.jsx',
      'src/components/ai/AIChat.jsx',
      'src/components/ai/PatternAnalysis.jsx',
      'src/components/ai/AIRecommendations.jsx',
      'src/pages/Login.jsx',
      'src/pages/Dashboard.jsx',
      'src/pages/Leaves.jsx',
      'src/pages/Profile.jsx',
      'src/pages/AIAssistant.jsx',
      'src/pages/Settings.jsx',
      'src/hooks/useAuth.js',
      'src/hooks/useLeaves.js',
      'src/hooks/useAI.js',
      'src/hooks/useApi.js',
      'src/services/api.js',
      'src/services/auth.service.js',
      'src/services/leave.service.js',
      'src/services/ai.service.js',
      'src/contexts/AuthContext.jsx',
      'src/utils/constants.js',
      'src/utils/dateHelpers.js',
      'src/utils/formatters.js'
    ];
    
    componentFiles.forEach(file => {
      const dir = path.dirname(file);
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(file, '// TODO: Add component content here\n');
    });
    
    log(`  ✓ Created ${componentFiles.length} component files`, 'green');
    
    // Create README.md with Bun instructions
    const readmeContent = `# Leave Management System - Frontend

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

\`\`\`bash
# Install dependencies with Bun
bun install

# Start development server
bun run dev

# Build for production
bun run build

# Preview production build
bun run preview
\`\`\`

## 🌍 Environment Variables

Create a \`.env\` file in the root directory:

\`\`\`env
VITE_API_BASE_URL=http://localhost:4000/api
VITE_APP_NAME=Leave Management System
VITE_APP_VERSION=1.0.0
\`\`\`

## 📱 Demo Credentials

The application includes built-in demo credentials:

- **Admin:** admin@demo.io / Admin@1234
- **Manager:** manager@demo.io / Manager@1234  
- **Employee:** employee@demo.io / Employee@1234

## 🏗️ Project Structure

\`\`\`
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
\`\`\`

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

- \`bun run dev\` - Start development server
- \`bun run build\` - Build for production
- \`bun run preview\` - Preview production build
- \`bun run lint\` - Run ESLint

## 🔗 Backend Integration

The frontend integrates with the Leave Management API:

- **Authentication** - JWT-based auth with role management
- **Leave Operations** - CRUD operations for leave requests
- **AI Services** - DeepSeek integration for intelligent features
- **Real-time Updates** - WebSocket support for live updates

## 📄 License

MIT License - see LICENSE file for details.
`;
    fs.writeFileSync('README.md', readmeContent);
    log('  ✓ Created comprehensive README.md', 'green');
    
    // Create bun.lockb if it doesn't exist (Bun's lockfile)
    if (!fs.existsSync('bun.lockb')) {
      log('  ✓ Bun lockfile will be created on first install', 'green');
    }
    
    log('\n✅ Frontend structure created successfully!', 'green');
    log('================================================================', 'yellow');
    
    // Display summary
    log('\n📊 Project Summary:', 'bright');
    log(`📁 Created in: ${process.cwd()}`, 'cyan');
    log(`📦 Package manager: Bun`, 'cyan');
    log(`⚡ Development server: Vite`, 'cyan');
    log(`🎨 CSS framework: Tailwind CSS`, 'cyan');
    log(`🔧 Build tool: Vite`, 'cyan');
    
    log('\n🎯 Next Steps:', 'bright');
    log('1. Copy file contents from the artifact into each component file', 'cyan');
    log('2. Start with these critical files:', 'cyan');
    log('   • src/App.jsx', 'blue');
    log('   • src/main.jsx', 'blue');
    log('   • src/index.css', 'blue');
    log('   • src/contexts/AuthContext.jsx', 'blue');
    log('   • src/services/api.js', 'blue');
    log('3. Run: bun run dev', 'cyan');
    log('4. Open: http://localhost:5173', 'cyan');
    
    log('\n🚀 Development Commands:', 'bright');
    log('  bun run dev     - Start development server', 'green');
    log('  bun run build   - Build for production', 'green');
    log('  bun run preview - Preview production build', 'green');
    log('  bun install     - Install dependencies', 'green');
    
    log('\n🔗 Integration:', 'bright');
    log('  Frontend: http://localhost:5173', 'cyan');
    log('  Backend:  http://localhost:4000', 'cyan');
    log('  API Docs: http://localhost:4000/docs', 'cyan');
    
    log('\n🎉 Ready to build your AI-powered leave management system!', 'green');
    
  } catch (error) {
    log(`\n❌ Error: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Run the setup
createReactFrontend();