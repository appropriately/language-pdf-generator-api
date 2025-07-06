# Language PDF Generator API <!-- omit in toc -->

- [About](#about)
  - [Stack](#stack)
- [Setup](#setup)
- [Available Scripts](#available-scripts)

## About

Built to experiment with Fastify and TypeScript. When deployed, documentation is available at `/docs`.

### Stack

- Fastify
- TypeScript
- Jest
- ESLint

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

## Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build the TypeScript code
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run test` - Run tests
