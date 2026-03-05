<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# UIDAI Intelligence System - Landing Page

> A modern, responsive landing page for the UIDAI Intelligence System featuring the Aadhar authentication platform with AI-driven insights and real-time threat detection.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the App](#running-the-app)
- [Build & Deployment](#build--deployment)
- [Project Structure](#project-structure)
- [Available Scripts](#available-scripts)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

This is the landing page component of the UIDAI Intelligence System, designed to provide visitors with comprehensive information about the platform's capabilities, features, and value propositions. The application showcases threat detection, analytics, and AI-driven insights for Aadhar intelligence.

**View your app in AI Studio:** https://ai.studio/apps/drive/15XvggKNL1dNE4997DY6lv2sMAVq1zj1x

## ✨ Features

- **Responsive Design** - Mobile-first, fully responsive layout using Tailwind CSS
- **Modern UI Components** - Built with React and TypeScript for type safety
- **Interactive Elements** - Smooth animations and transitions
- **Documentation** - Comprehensive feature documentation
- **Call-to-Action** - Strategic CTAs for user engagement
- **Tech Stack Showcase** - Display of integrated technologies
- **Chat Widget** - Interactive chat support interface
- **Performance Optimized** - Fast loading and smooth user experience

## 🛠️ Tech Stack

| Technology | Purpose |
|-----------|---------|
| **React 18** | UI framework |
| **TypeScript** | Type-safe JavaScript |
| **Vite** | Build tool & dev server |
| **Tailwind CSS** | Utility-first CSS framework |
| **PostCSS** | CSS processing |
| **Node.js** | Runtime environment |

## 📋 Prerequisites

Before getting started, ensure you have the following installed:

- **Node.js** (v16.0.0 or higher)
- **npm** (v7.0.0 or higher) or **yarn**
- **Git** (optional, for version control)

Verify installations:
```bash
node --version
npm --version
```

## 🚀 Installation

### 1. Clone or Download the Repository

```bash
# If using git
git clone <repository-url>
cd aadhaar-landing-page
```

### 2. Install Dependencies

```bash
npm install
```

or if using yarn:

```bash
yarn install
```

## ⚙️ Configuration

### Environment Variables

Create a `.env.local` file in the root directory and add the required environment variables:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3000

# Analytics (if applicable)
VITE_ANALYTICS_ID=your_analytics_id

# Gemini API Key (for AI features)
VITE_GEMINI_API_KEY=your_gemini_api_key
```

**Important:** Never commit `.env.local` to version control. Add it to `.gitignore`.

## 🎮 Running the App

### Development Mode

Start the development server with hot module replacement:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Production Build

Build the application for production:

```bash
npm run build
```

This creates an optimized build in the `dist/` directory.

## 📦 Build & Deployment

### Build the Project

```bash
npm run build
```

### Preview Production Build Locally

```bash
npm run preview
```

### Deploy Options

- **Vercel** - Zero-config deployment
- **Netlify** - Drag-and-drop or git integration
- **GitHub Pages** - Static hosting
- **AWS S3 + CloudFront** - Scalable distribution
- **Docker** - Containerized deployment

Example Docker deployment:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 5173
CMD ["npm", "run", "preview"]
```

## 📁 Project Structure

```
aadhaar-landing-page/
├── components/              # React components
│   ├── Hero.tsx
│   ├── Features.tsx
│   ├── TechStack.tsx
│   ├── Workflow.tsx
│   ├── Documentation.tsx
│   ├── ProblemStatement.tsx
│   ├── Stats.tsx
│   ├── CallToAction.tsx
│   ├── ChatWidget.tsx
│   ├── Footer.tsx
│   └── Navbar.tsx
├── App.tsx                  # Main app component
├── index.tsx                # Entry point
├── types.ts                 # TypeScript type definitions
├── metadata.json            # App metadata
├── index.html               # HTML template
├── tailwind.config.js       # Tailwind CSS config
├── vite.config.ts           # Vite configuration
├── tsconfig.json            # TypeScript config
├── postcss.config.js        # PostCSS configuration
├── package.json             # Dependencies & scripts
└── README.md                # This file
```

## 📝 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Create production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint (if configured) |
| `npm run type-check` | Check TypeScript types |

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Create a feature branch: `git checkout -b feature/amazing-feature`
2. Commit changes: `git commit -m 'Add amazing feature'`
3. Push to branch: `git push origin feature/amazing-feature`
4. Open a Pull Request

## 📄 License

This project is part of the UIDAI Intelligence System initiative.

## 📞 Support

For issues, questions, or feedback:
- Open an issue on GitHub
- Contact the development team
- Check the documentation section in the app

---

**Made with ❤️ for UIDAI Intelligence System**
