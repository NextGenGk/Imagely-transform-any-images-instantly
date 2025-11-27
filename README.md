# Imagely - Transform Images Instantly

A Next.js application that converts natural language image processing requests into structured JSON specifications. Simply describe what you want in plain English, and the system will parse your request and process your images accordingly.

<img width="1326" height="828" alt="hero" src="https://github.com/user-attachments/assets/9c24597f-c99b-4d3c-8501-731bbf44c72e" />

## Features

- **Natural Language Processing**: Powered by Google Gemini AI to understand complex requests.
- **Smart Parsing**: Automatically recognizes:
  - **Passport Photos**: Standard (35x45mm) and US (2x2 inch) formats.
  - **Dimensions**: Pixels (1280x720), Millimeters (35mm), Inches.
  - **File Size**: Constraints like "under 1MB" or "compress to 50KB".
  - **Formats**: Convert between JPG, PNG, WebP.
  - **Backgrounds**: Remove background or change to specific colors (white, blue, etc.).
  - **Enhancements**: Blur, sharpen, grayscale, contrast adjustments.
  - **Transformations**: Rotate, flip, crop.
- **User Authentication**: Secure sign-up and login with Clerk.
- **Image Processing**: High-quality transformations using ImageKit.io.
- **Request History**: Track your previous processing requests.
- **Modern UI**: Built with Tailwind CSS for a responsive and beautiful experience.

## Usage Examples

Describe your desired output in plain English:

- **Passport Photo**: "Convert this to a passport photo with a white background"
- **Social Media**: "Resize to 1080x1080 and make it black and white"
- **Web Optimization**: "Convert to WebP and compress to under 200KB"
- **Specific Edits**: "Rotate 90 degrees, flip horizontally, and increase contrast"
- **Professional**: "Set DPI to 300 and resize to 4x6 inches"

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Clerk
- **Database**: PostgreSQL (Neon) with Prisma ORM
- **AI/NLP**: Google Gemini API
- **Image Processing**: ImageKit.io
- **Testing**: Vitest + fast-check

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Clerk account
- Google Gemini API key
- ImageKit.io account

### Installation

1. **Clone the repository**

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Copy `.env.example` to `.env.local` and fill in your credentials:
   ```bash
   cp .env.example .env.local
   ```

4. **Database Setup**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run Development Server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) with your browser.

## Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run test`: Run tests
- `npm run test:watch`: Run tests in watch mode
- `npm run db:migrate`: Run database migrations
- `npm run deploy:db`: Deploy database changes (Linux/Mac)
- `npm run deploy:db:windows`: Deploy database changes (Windows)

## License

ISC
