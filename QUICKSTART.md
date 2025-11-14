# Quick Start Guide

This guide will help you get the Froncort Collaborative Document Editor up and running quickly.

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn

## Quick Setup (5 minutes)

### Step 1: Clone and Install

```bash
# Navigate to the project root
cd /Users/ved/froncort

# Install all dependencies
cd backend && npm install
cd ../frontend && npm install
cd ../hocuspocus-server && npm install
```

### Step 2: Database Setup

```bash
# Create PostgreSQL database
createdb froncort

# Navigate to backend
cd backend

# Copy environment file
cp .env.example .env

# Edit .env and add your PostgreSQL connection string:
# DATABASE_URL="postgresql://username:password@localhost:5432/froncort"

# Push schema to database
npx prisma db push
npx prisma generate
```

### Step 3: Configure Environment Variables

#### Backend (.env)

```bash
cd backend
cp .env.example .env
# Edit with your database credentials
```

#### Frontend (.env.local)

```bash
cd frontend
cp .env.example .env.local
```

#### WebSocket Server (.env)

```bash
cd hocuspocus-server
cp .env.example .env
```

### Step 4: Start All Services

Open 3 terminal windows:

**Terminal 1 - Backend API:**

```bash
cd backend
npm run dev
# Should start on http://localhost:3001
```

**Terminal 2 - WebSocket Server:**

```bash
cd hocuspocus-server
npm run dev
# Should start on ws://localhost:1234
```

**Terminal 3 - Frontend:**

```bash
cd frontend
npm run dev
# Should start on http://localhost:3000
```

## Testing the Application

1. Open browser to `http://localhost:3000`
2. Enter a document title and click "Create Document"
3. You'll receive a 9-digit Document ID and 4-digit PIN
4. Click "Open Document" to start editing
5. Share the Document ID and PIN with others to collaborate!

## Testing Collaboration

1. Open the app in two different browser windows (or incognito)
2. In Window 1: Create a document
3. Copy the Document ID and PIN
4. In Window 2: Click "Join with Document ID & Pin"
5. Enter the credentials from Window 1
6. Start typing in either window - changes appear in real-time!

## Troubleshooting

### Backend won't start

- Ensure PostgreSQL is running: `pg_isready`
- Check DATABASE_URL in backend/.env
- Run `npx prisma db push` to create tables

### Frontend can't connect to backend

- Verify backend is running on port 3001
- Check NEXT_PUBLIC_API_URL in frontend/.env.local

### WebSocket connection fails

- Ensure WebSocket server is running on port 1234
- Check NEXT_PUBLIC_WS_URL in frontend/.env.local
- Check browser console for connection errors

### Port conflicts

You can change ports in the respective .env files:

- Backend: Change PORT in backend/.env
- WebSocket: Change PORT in hocuspocus-server/.env
- Frontend: Use `npm run dev -- -p 3001` to change port

## Next Steps

- Customize the editor toolbar in `frontend/components/CollaborativeEditor.tsx`
- Add authentication in `backend/src/controllers/`
- Deploy to production (see main README.md)

## Support

For issues, check:

- Browser console (F12) for frontend errors
- Backend terminal for API errors
- WebSocket server terminal for connection issues
