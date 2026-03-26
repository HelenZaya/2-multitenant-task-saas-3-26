# Setup

## Local with Docker
1. Install Docker Desktop.
2. From project root run:
   `docker-compose up --build`
3. Open `https://localhost`
4. Demo login:
   - workspace: `zenith-demo`
   - email: `admin@zenith.local`
   - password: `Admin123!`

## Local without Docker
### Backend
```bash
cd backend
cp ../.env.example .env
npm install
npm run prisma:generate
npm run prisma:push
npm run seed
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```
