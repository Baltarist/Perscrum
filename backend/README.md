# Kişisel Scrum Koçu AI - Backend API

Backend API for a personal Scrum coaching application with AI integration.

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- npm v9+

### Installation
```bash
# Clone and navigate to backend
cd backend

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Seed database with sample data
npm run prisma:seed

# Start development server
npm run dev
```

Server will start on `http://localhost:5000`

## 📊 Current Status - Phase 1 Complete (95%)

✅ **COMPLETED FEATURES:**
- Complete authentication system (JWT + refresh tokens)
- User management (profile, settings, badges, notifications)
- Database schema with SQLite (ready for PostgreSQL)
- Validation & error handling
- Rate limiting (subscription-based)
- TypeScript architecture
- 11+ API endpoints ready

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user

### User Management
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/settings` - Get user settings
- `PUT /api/users/settings` - Update settings
- `POST /api/users/checkin` - Daily check-in
- `GET /api/users/badges` - Get user badges
- `GET /api/users/notifications` - Get notifications
- `GET /api/users/stats` - Get user statistics

### Health & Info
- `GET /health` - Health check
- `GET /api` - API information

## 🧪 Testing

Use the `test-api.http` file with VS Code REST Client extension:

### Sample Test Flow:
1. **Register**: `POST /api/auth/register`
2. **Login**: `POST /api/auth/login`
3. **Get Profile**: `GET /api/users/profile`
4. **Update Settings**: `PUT /api/users/settings`
5. **Daily Checkin**: `POST /api/users/checkin`

### Test Users (from seed data):
- **Email**: alex@example.com | **Password**: password123 (Pro user)
- **Email**: maria@example.com | **Password**: password123 (Free user)

## 📁 Project Structure

```
backend/
├── src/
│   ├── controllers/    # HTTP request handlers
│   ├── services/       # Business logic
│   ├── middleware/     # Authentication, validation, etc.
│   ├── routes/         # Route definitions
│   ├── types/          # TypeScript types
│   ├── utils/          # Helper functions
│   └── config/         # Configuration files
├── prisma/             # Database schema & migrations
│   ├── schema.prisma   # Database schema
│   └── seed.ts         # Sample data
└── generated/          # Generated Prisma client
```

## 🛠️ Development Commands

```bash
# Development
npm run dev              # Start dev server with nodemon
npm run build           # Build TypeScript
npm start               # Start production server

# Database
npm run prisma:generate # Generate Prisma client
npm run prisma:migrate  # Run migrations
npm run prisma:seed     # Seed sample data
npm run prisma:studio   # Open Prisma Studio

# Testing & Quality
npm run test            # Run tests (Jest)
npm run lint            # Run ESLint
npm run lint:fix        # Fix linting issues
```

## 🔒 Security Features

- JWT access & refresh tokens
- Password hashing (bcrypt, 12 salt rounds)
- Rate limiting (global + endpoint-specific)
- Input validation (Zod schemas)
- CORS protection
- Helmet security headers
- SQL injection protection (Prisma ORM)

## 📊 Database

### Current: SQLite (Development)
- File: `./dev.db`
- Perfect for development & testing
- No external dependencies

### Production Ready: PostgreSQL
- Simply change DATABASE_URL in .env
- Full Prisma schema compatibility
- All features supported

### Schema Highlights:
- Users with subscription tiers
- Projects with team collaboration
- Sprints with task management
- AI integration ready
- Gamification (badges, streaks)
- Real-time notifications ready

## 🚦 Rate Limits

| Tier | Daily AI Requests | Auth Attempts | Global |
|------|------------------|---------------|---------|
| Free | 10 | 5/min | 100/min |
| Pro | 1000 | 5/min | 100/min |
| Enterprise | Unlimited | 5/min | 100/min |

## 🔮 Next Phases

### Phase 2: Core Features
- Project management API
- Sprint & task management
- Team collaboration
- Kanban board endpoints

### Phase 3: AI Integration
- Google Gemini API integration
- Task suggestions
- AI coaching chat
- Retrospective analysis

### Phase 4: Advanced Features
- Real-time updates (Socket.io)
- Email notifications
- File uploads
- Analytics & reporting

## 🐛 Troubleshooting

### Common Issues:

**Database Connection Error:**
```bash
# Regenerate Prisma client
npm run prisma:generate

# Reset database
npm run prisma:migrate reset
npm run prisma:seed
```

**TypeScript Errors:**
```bash
# Rebuild project
npm run build
```

**Port Already in Use:**
```bash
# Change PORT in .env file
echo "PORT=5001" >> .env
```

## 📚 API Documentation

Full API documentation available at:
- **Development**: `http://localhost:5000/api`
- **Interactive Testing**: Use `test-api.http` file

## 🤝 Contributing

1. Follow TypeScript strict mode
2. Use Zod for validation
3. Add proper error handling
4. Write tests for new features
5. Update API documentation

---

**Status**: Phase 1 Complete ✅ | Ready for Phase 2 Development 🚀