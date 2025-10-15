# Microrefactor Project

A full-stack application with a backend built using Elysia and Bun runtime, and a frontend built with Svelte.

## Project Structure

- `backend/` - Backend API server using Elysia framework with Bun
- `frontend/` - Frontend application built with SvelteKit
- `contracts/` - Smart contracts (Cairo/Starknet)

## Prerequisites

- [Bun](https://bun.sh/) - JavaScript runtime and package manager
- [Node.js](https://nodejs.org/) (for frontend if not using Bun)
- [Git](https://git-scm.com/)

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd microrefactor
   ```

2. Install dependencies for backend:
   ```bash
   cd backend
   bun install
   ```

3. Install dependencies for frontend:
   ```bash
   cd ../frontend
   bun install
   # or npm install
   ```

## Development

### Backend

To start the backend development server:

```bash
cd backend
bun run dev
```

The server will start on http://localhost:3000

### Frontend

To start the frontend development server:

```bash
cd frontend
bun run dev
# or npm run dev
```

Open http://localhost:5173 with your browser to see the result.

## Building

### Backend

```bash
cd backend
bun run build
```

### Frontend

```bash
cd frontend
bun run build
# or npm run build
```

## Environment Variables

Create `.env` files in both `backend/` and `frontend/` directories as needed. These are already ignored by git.

## Contributing

1. Make sure to follow the existing code style
2. Test your changes
3. Create a pull request

## License

[Add license information here]