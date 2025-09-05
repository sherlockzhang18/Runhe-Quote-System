# Simple Next.js App with PostgreSQL and Drizzle ORM

This is a Next.js application with TypeScript, PostgreSQL database, and Drizzle ORM for database management.

## Prerequisites

- Node.js 18+ 
- Docker and Docker Compose
- npm or yarn

## Getting Started

### 1. Environment Setup

Copy the environment example file:

```bash
cp .env.example .env.local
```

Update the `.env.local` file with your configuration if needed.

### 2. Development Setup

#### Option A: Start PostgreSQL only in Docker

This is ideal for development when you want to run the Next.js app locally but use PostgreSQL in Docker:

```bash
# Start only PostgreSQL database
docker-compose up postgres -d

# Install dependencies (if not already done)
npm install

# Generate Drizzle migrations
npm run drizzle:generate

# Run migrations
npm run drizzle:migrate

# Start the development server
npm run dev
```

The app will be available at `http://localhost:3000` and PostgreSQL at `localhost:5432`.

#### Option B: Run everything in Docker

To run both the Next.js app and PostgreSQL in Docker:

```bash
# Build and start all services
docker-compose up --build -d
```

The app will be available at `http://localhost:3000`.

### 3. Database Management

```bash
# Generate new migration after schema changes
npm run drizzle:generate

# Apply migrations
npm run drizzle:migrate
```

### 4. Stopping Services

```bash
# Stop all running containers
docker-compose down

# Stop and remove volumes (this will delete database data)
docker-compose down -v
```

## Docker Commands Summary

| Command | Description |
|---------|-------------|
| `docker-compose up postgres -d` | Start only PostgreSQL for development |
| `docker-compose up --build -d` | Build and start the full application stack |
| `docker-compose down` | Stop all containers |
| `docker-compose down -v` | Stop containers and remove volumes |
| `docker-compose logs app` | View application logs |
| `docker-compose logs postgres` | View PostgreSQL logs |

## Project Structure

```
├── drizzle/
│   ├── schema.ts          # Database schema definitions
│   └── migrations/        # Auto-generated migration files
├── lib/
│   └── db.ts             # Database connection setup
├── pages/                # Next.js pages (Page Router)
├── public/               # Static assets
├── styles/               # CSS styles
├── docker-compose.yml    # Docker services configuration
├── Dockerfile            # Docker image for Next.js app
├── drizzle.config.ts     # Drizzle ORM configuration
└── next.config.ts        # Next.js configuration
```

## Environment Variables

- `POSTGRES_URL`: PostgreSQL connection string
- `NEXT_PUBLIC_APP_URL`: Public URL of the application

## Development Notes

- The PostgreSQL database persists data in a Docker volume named `postgres_data`
- The Next.js app is configured with standalone output for Docker optimization
- Drizzle ORM is used for type-safe database operations
- The setup supports both local development and full Docker deployment

---

## Original Next.js Documentation

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes) instead of React pages.

This project uses [`next/font`](https://nextjs.org/docs/pages/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn-pages-router) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/pages/building-your-application/deploying) for more details.
