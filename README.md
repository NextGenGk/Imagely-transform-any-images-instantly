# NLP Image Processor

A Next.js application that converts natural language image processing requests into structured JSON specifications. Simply describe what you want in plain English (e.g., "convert this to a passport photo 300 ppi" or "resize to 1280x720"), and the system will parse your request and process your images accordingly.

## Features

- **Natural Language Processing**: Parse image processing requests using Google Gemini AI
- **Smart Parsing**: Automatically recognizes passport photo requirements, dimensions in multiple units (pixels, mm, inches), DPI/PPI, file size constraints, background changes, and format conversions
- **User Authentication**: Secure authentication and user management with Clerk
- **Image Processing**: Professional image transformations powered by ImageKit.io
- **Request History**: Track and reuse previous processing requests with PostgreSQL (Neon) and Prisma
- **Comprehensive Testing**: Property-based testing with fast-check and unit testing with Vitest

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- PostgreSQL database (Neon recommended)
- Clerk account
- Google Gemini API key
- ImageKit.io account

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

4. Set up the database:

```bash
npx prisma generate
npx prisma db push
```

5. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Testing

Run tests:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

Run tests with UI:

```bash
npm run test:ui
```

## Project Structure

```
├── app/                  # Next.js App Router pages
├── components/           # React components
├── lib/                  # Utility functions and services
├── prisma/              # Database schema
├── public/              # Static assets
└── tests/               # Test files
```

## Tech Stack

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Clerk
- **Database**: PostgreSQL (Neon) with Prisma ORM
- **NLP**: Google Gemini API
- **Image Processing**: ImageKit.io
- **Testing**: Vitest + fast-check

## Deployment

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

### Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/nlp-image-processor)

1. Click the button above
2. Add all required environment variables
3. Deploy!

### Environment Variables

All required environment variables are documented in [.env.example](./.env.example).

Key variables:
- `DATABASE_URL` - PostgreSQL connection string
- `CLERK_SECRET_KEY` - Clerk authentication
- `GEMINI_API_KEY` - Google Gemini API
- `IMAGEKIT_PRIVATE_KEY` - ImageKit.io API

### Database Migrations

Before deploying, run database migrations:

```bash
npm run deploy:db
```

Or on Windows:

```bash
npm run deploy:db:windows
```

### Docker Deployment

Build and run with Docker:

```bash
docker build -t nlp-image-processor .
docker run -p 3000:3000 --env-file .env.local nlp-image-processor
```

Or use Docker Compose:

```bash
docker-compose up
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run test` - Run tests
- `npm run lint` - Run linter
- `npm run type-check` - Run TypeScript type checking
- `npm run validate` - Run all checks (type-check, lint, test)
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio
- `npm run build:production` - Build with migrations

## Documentation

- [API Documentation](./docs/API.md) - Complete API reference
- [Query Syntax Guide](./docs/QUERY_SYNTAX.md) - How to write natural language queries
- [Testing Guide](./docs/TESTING.md) - Testing procedures and guidelines
- [Deployment Guide](./DEPLOYMENT.md) - Complete deployment instructions
- [Deployment Checklist](./docs/DEPLOYMENT_CHECKLIST.md) - Pre/post deployment checklist
- [Security Guide](./SECURITY.md) - Security best practices
- [Monitoring Guide](./docs/MONITORING_SUMMARY.md) - Monitoring and logging
- [Environment Variables](./docs/ENVIRONMENT_VARIABLES.md) - Complete environment variable reference

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## Support

For issues or questions:
- Check the [Deployment Guide](./DEPLOYMENT.md)
- Review [Troubleshooting](./DEPLOYMENT.md#troubleshooting) section
- Open an issue on GitHub

## License

ISC
