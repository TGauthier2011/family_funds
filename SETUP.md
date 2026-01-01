# Local Environment Setup Guide

This guide will help you set up your local development environment for the Family Funds application.

## Prerequisites

- **Node.js** (v20 or higher) - ✅ You have v24.12.0
- **npm** (v11.6.2 or higher) - ✅ You have v11.6.2

## Setup Steps

### 1. Install Dependencies

Dependencies have been installed. If you need to reinstall:

```bash
npm install
```

### 2. Configure Environment Variables

✅ **Firebase is already configured!** Your Firebase credentials have been added to `.env.local`.

You still need to set up your Google AI (Gemini) API key:

1. Visit [Google AI Studio](https://aistudio.google.com/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the API key
5. Open `.env.local` and replace `your_api_key_here` with your actual API key:

```
GOOGLE_GENAI_API_KEY=your_actual_api_key_here
```

**Note:** The `.env.local` file contains your Firebase configuration and is already set up. It's gitignored for security.

### 3. Run the Development Server

Start the Next.js development server:

```bash
npm run dev
```

The application will be available at: **http://localhost:9002**

### 4. (Optional) Run Genkit Development Server

If you want to test the AI flows separately, you can run:

```bash
npm run genkit:dev
```

Or with watch mode for auto-reload:

```bash
npm run genkit:watch
```

## Available Scripts

- `npm run dev` - Start Next.js development server on port 9002
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking
- `npm run genkit:dev` - Start Genkit development server
- `npm run genkit:watch` - Start Genkit with watch mode

## Troubleshooting

### Port Already in Use

If port 9002 is already in use, you can change it in `package.json`:

```json
"dev": "next dev --turbopack -p 9003"
```

### Missing API Key

If you see errors related to Google AI, make sure:
1. Your `.env.local` file exists
2. The `GOOGLE_GENAI_API_KEY` is set correctly
3. The API key is valid and has the necessary permissions

### TypeScript Errors

The project has TypeScript build errors ignored in `next.config.ts`. To see them:

```bash
npm run typecheck
```

## Next Steps

1. ✅ Dependencies installed
2. ✅ Firebase configuration added to `.env.local`
3. ✅ Firebase initialization file created (`src/lib/firebase.ts`)
4. ✅ Google AI API key configured in `.env.local`
5. ⏳ Run `npm run dev` to start the development server
6. ⏳ Open http://localhost:9002 in your browser

**You're all set!** All environment variables are configured. You can now start the development server.

Happy coding! 🚀

