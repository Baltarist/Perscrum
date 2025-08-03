# Kişisel Scrum Koçu AI - Backend Teknik Analizi ve Proje Planı

## 📋 Proje Genel Özeti

**Proje Adı:** Kişisel Scrum Koçu AI Backend API  
**Frontend Framework:** React + TypeScript  
**Hedef Backend:** Node.js + Express + TypeScript + PostgreSQL  
**AI Entegrasyonu:** Google Gemini API  
**Mimari:** RESTful API + Real-time WebSocket bağlantıları

## 🏗️ Backend Teknik Mimarisi

### 1. Teknoloji Stack'i

#### **Ana Teknolojiler**
- **Runtime:** Node.js (v18+)
- **Framework:** Express.js + TypeScript
- **Veritabanı:** PostgreSQL (v15+) + Redis (cache/sessions)
- **ORM:** Prisma
- **Validasyon:** Zod
- **Kimlik Doğrulama:** JWT + bcrypt
- **AI Entegrasyonu:** Google Gemini API (@google/genai)
- **Real-time:** Socket.io
- **Dosya Upload:** Multer + AWS S3/CloudFlare R2
- **Email:** NodeMailer
- **Process Management:** PM2

#### **Geliştirme Araçları**
- **Linting:** ESLint + Prettier
- **Testing:** Jest + Supertest
- **API Dokümantasyonu:** Swagger/OpenAPI
- **Containerization:** Docker + Docker Compose
- **CI/CD:** GitHub Actions

### 2. Proje Dizin Yapısı

```
backend/
├── src/
│   ├── controllers/          # API endpoint controllers
│   │   ├── auth.controller.ts
│   │   ├── projects.controller.ts
│   │   ├── sprints.controller.ts
│   │   ├── tasks.controller.ts
│   │   ├── ai.controller.ts
│   │   ├── users.controller.ts
│   │   └── analytics.controller.ts
│   ├── middleware/           # Custom middleware
│   │   ├── auth.middleware.ts
│   │   ├── validation.middleware.ts
│   │   ├── rateLimit.middleware.ts
│   │   └── subscription.middleware.ts
│   ├── services/            # Business logic
│   │   ├── auth.service.ts
│   │   ├── project.service.ts
│   │   ├── ai.service.ts
│   │   ├── notification.service.ts
│   │   ├── email.service.ts
│   │   └── payment.service.ts
│   ├── models/              # Prisma schema & types
│   │   ├── schema.prisma
│   │   └── types.ts
│   ├── routes/              # API routes
│   │   ├── auth.routes.ts
│   │   ├── projects.routes.ts
│   │   ├── tasks.routes.ts
│   │   ├── ai.routes.ts
│   │   └── index.ts
│   ├── utils/               # Utility functions
│   │   ├── jwt.utils.ts
│   │   ├── validation.utils.ts
│   │   ├── email.utils.ts
│   │   └── helpers.ts
│   ├── config/              # Configuration
│   │   ├── database.ts
│   │   ├── redis.ts
│   │   └── constants.ts
│   ├── sockets/             # WebSocket handlers
│   │   ├── ai-chat.socket.ts
│   │   └── notifications.socket.ts
│   └── app.ts               # Express app setup
├── tests/                   # Test files
├── docker-compose.yml
├── Dockerfile
├── package.json
└── tsconfig.json
```

## 🗄️ Veritabanı Şeması (PostgreSQL)

### Ana Tablolar:

#### **users**
```sql
- id (UUID, PRIMARY KEY)
- email (VARCHAR, UNIQUE)
- password_hash (VARCHAR)
- display_name (VARCHAR)
- subscription_tier (ENUM: free, pro, enterprise)
- ai_usage_count (INTEGER, DEFAULT 0)
- subscription_end_date (TIMESTAMP)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### **user_settings**
```sql
- user_id (UUID, FK to users)
- sprint_duration_weeks (INTEGER)
- daily_checkin_enabled (BOOLEAN)
- daily_checkin_time (TIME)
- retrospective_enabled (BOOLEAN)
- ai_coach_name (VARCHAR)
```

#### **projects**
```sql
- id (UUID, PRIMARY KEY)
- title (VARCHAR)
- description (TEXT)
- status (ENUM: active, paused, completed)
- color_theme (VARCHAR)
- target_completion_date (DATE)
- estimated_completion_date (DATE)
- total_sprints (INTEGER)
- sprint_duration_weeks (INTEGER)
- owner_id (UUID, FK to users)
- created_at (TIMESTAMP)
```

#### **sprints**
```sql
- id (UUID, PRIMARY KEY)
- project_id (UUID, FK to projects)
- sprint_number (INTEGER)
- goal (TEXT)
- status (ENUM: planning, active, completed)
- start_date (DATE)
- end_date (DATE)
- velocity_points (INTEGER)
- retrospective_good (TEXT)
- retrospective_improve (TEXT)
```

#### **tasks**
```sql
- id (UUID, PRIMARY KEY)
- sprint_id (UUID, FK to sprints)
- title (VARCHAR)
- description (TEXT)
- status (ENUM: backlog, todo, in_progress, review, done)
- story_points (INTEGER)
- planned_date (DATE)
- completed_at (TIMESTAMP)
- created_by (UUID, FK to users)
- assignee_id (UUID, FK to users)
- is_ai_assisted (BOOLEAN)
```

#### **subtasks**
```sql
- id (UUID, PRIMARY KEY)
- task_id (UUID, FK to tasks)
- title (VARCHAR)
- is_completed (BOOLEAN)
- created_by (UUID, FK to users)
- assignee_id (UUID, FK to users)
- is_ai_assisted (BOOLEAN)
```

## 🔌 API Endpoint'leri

### **Authentication**
```
POST   /api/auth/register     # Kullanıcı kayıt
POST   /api/auth/login        # Kullanıcı giriş
POST   /api/auth/logout       # Çıkış (JWT invalidate)
POST   /api/auth/refresh      # Token yenileme
POST   /api/auth/forgot       # Şifre sıfırlama
```

### **Users**
```
GET    /api/users/profile     # Kullanıcı profili
PUT    /api/users/profile     # Profil güncelle
PUT    /api/users/settings    # Ayarları güncelle
GET    /api/users/badges      # Kullanıcı rozetleri
POST   /api/users/checkin     # Günlük check-in kaydet
```

### **Projects**
```
GET    /api/projects          # Kullanıcının projeleri
POST   /api/projects          # Yeni proje oluştur
GET    /api/projects/:id      # Proje detay
PUT    /api/projects/:id      # Proje güncelle
DELETE /api/projects/:id      # Proje sil
POST   /api/projects/:id/complete # Proje tamamla
```

### **Sprints**
```
GET    /api/projects/:id/sprints        # Sprint listesi
POST   /api/projects/:id/sprints        # Yeni sprint
PUT    /api/sprints/:id                 # Sprint güncelle
POST   /api/sprints/:id/complete        # Sprint tamamla
GET    /api/sprints/:id/report          # Sprint raporu
```

### **Tasks**
```
GET    /api/sprints/:id/tasks           # Sprint görevleri
POST   /api/sprints/:id/tasks           # Yeni görev
PUT    /api/tasks/:id                   # Görev güncelle
DELETE /api/tasks/:id                   # Görev sil
POST   /api/tasks/:id/subtasks          # Alt görev ekle
PUT    /api/subtasks/:id                # Alt görev güncelle
```

### **AI Features**
```
POST   /api/ai/task-suggestions         # AI görev önerileri
POST   /api/ai/subtask-suggestions      # AI alt görev önerileri
POST   /api/ai/chat                     # AI sohbet
POST   /api/ai/retrospective            # AI retrospektif önerileri
POST   /api/ai/educational-content      # Eğitim içeriği arama
POST   /api/ai/break-down-task          # Takılmış görev çözme
```

### **Analytics**
```
GET    /api/analytics/velocity          # Hız trendi
GET    /api/analytics/burndown/:sprintId # Burndown grafiği
POST   /api/analytics/overall-report    # Genel analiz raporu
```

### **Subscriptions**
```
GET    /api/subscription/plans          # Mevcut planlar
POST   /api/subscription/upgrade        # Plan yükseltme
POST   /api/subscription/cancel         # İptal
PUT    /api/subscription/payment        # Ödeme yöntemi güncelle
```

## 🔒 Güvenlik Gereksinimleri

### **1. Kimlik Doğrulama & Yetkilendirme**
- JWT token tabanlı authentication
- Refresh token implementasyonu
- Role-based access control (RBAC)
- Rate limiting (100 req/min per user)

### **2. Veri Güvenliği**
- Şifrelerin bcrypt ile hash'lenmesi (salt rounds: 12)
- Hassas verilerin encrypt edilmesi
- SQL injection koruması (Prisma ORM)
- XSS koruması

### **3. API Güvenliği**
- CORS politikaları
- Helmet.js security headers
- Request validation (Zod)
- File upload size limits

## 🤖 AI Entegrasyonu Detayları

### **1. Gemini API Kullanımı**
- API key management (environment variables)
- Request/response caching (Redis)
- Error handling & fallback strategies
- Usage tracking & limits

### **2. AI Özellikleri**
- Task suggestion generation
- Subtask breakdown
- Chat conversation management
- Retrospective analysis
- Educational content search
- Overall progress analysis

### **3. Subscription Limits**
```typescript
const AI_LIMITS = {
  free: { daily: 10, monthly: 100 },
  pro: { daily: 1000, monthly: -1 }, // unlimited
  enterprise: { daily: -1, monthly: -1 }
}
```

## 📊 Performans Optimizasyonları

### **1. Caching Strategy**
- Redis ile session caching
- API response caching (15 min TTL)
- AI response caching (1 hour TTL)
- Database query optimization

### **2. Database Optimizations**
- Indexing critical columns
- Pagination for large datasets
- Connection pooling
- Query optimization

### **3. Real-time Features**
- Socket.io için efficient event handling
- Connection management
- Room-based messaging

## 🚀 Deployment ve DevOps

### **1. Containerization**
```yaml
# docker-compose.yml
services:
  api:
    build: .
    environment:
      - DATABASE_URL
      - REDIS_URL
      - GEMINI_API_KEY
    depends_on:
      - postgres
      - redis
  
  postgres:
    image: postgres:15
    
  redis:
    image: redis:7-alpine
```

### **2. Environment Variables**
```bash
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
GEMINI_API_KEY=...
JWT_SECRET=...
SMTP_CONFIG=...
AWS_S3_CONFIG=...
```

## 📅 Detaylı Geliştirme Planı - GÜNCEL DURUM

### **Faz 1: Temel API (Hafta 1-2) - 🎉 %95 TAMAMLANDI**
- [x] ✅ **Proje kurulumu ve konfigürasyon**
  - [x] NPM projesi ve dependencies kurulumu (express, prisma, jwt, bcrypt, zod, etc.)
  - [x] TypeScript konfigürasyonu (tsconfig.json) - strict mode, paths mapping
  - [x] Proje dizin yapısı oluşturma (src/controllers, services, middleware, routes, types, config)
  - [x] Environment variables setup (.env, .env.example)
  - [x] Build system setup (npm scripts, TypeScript compilation)

- [x] ✅ **Database schema ve migrations**
  - [x] Prisma ORM kurulumu ve konfigürasyonu
  - [x] Kapsamlı PostgreSQL schema tasarımı:
    - [x] User management (users, user_settings, user_badges, daily_checkins)
    - [x] Project management (projects, team_members)
    - [x] Sprint & Task management (sprints, tasks, subtasks, task_status_changes)
    - [x] AI integration (ai_comments, chat_messages)
    - [x] Gamification (badges, user_badges)
    - [x] Notifications (notifications)
  - [x] İlişkiler ve enums tanımları (SubscriptionTier, TaskStatus, ProjectStatus, etc.)
  - [x] Prisma client oluşturma (generated/prisma)
  - [x] ✅ **Database server setup ve migration çalıştırma** (SQLite - dev.db)
  - [x] ✅ **Seed data script oluşturma ve çalıştırma** (prisma/seed.ts - test data ready)

- [x] ✅ **Authentication sistem**
  - [x] JWT utility functions (generateAccessToken, generateRefreshToken, verifyToken)
  - [x] Authentication middleware (protect routes, optional auth)
  - [x] Authorization middleware (subscription-based access, project access)
  - [x] Password hashing utilities (bcrypt, salt rounds: 12)
  - [x] Rate limiting middleware:
    - [x] Global rate limiting (100 req/min)
    - [x] Auth endpoints (5 attempts/min)
    - [x] AI endpoints (subscription-based limits)

- [x] ✅ **User management endpoints** - **TAMAMLANDI**
  - [x] **Auth routes**: 
    - [x] POST /api/auth/register (validation + rate limiting)
    - [x] POST /api/auth/login (validation + rate limiting)
    - [x] POST /api/auth/logout
    - [x] POST /api/auth/refresh (refresh token validation)
    - [x] GET /api/auth/me (current user profile)
  - [x] **User profile routes**: 
    - [x] GET /api/users/profile (with badges, notifications, stats)
    - [x] PUT /api/users/profile (email, displayName update)
  - [x] **User settings routes**: 
    - [x] GET /api/users/settings
    - [x] PUT /api/users/settings (sprint duration, daily checkin, AI coach name)
  - [x] **Additional user features**:
    - [x] POST /api/users/checkin (daily checkin with badge earning)
    - [x] GET /api/users/badges (user badge collection)
    - [x] GET /api/users/notifications (paginated)
    - [x] PUT /api/users/notifications/:id/read
    - [x] PUT /api/users/notifications/read-all
    - [x] PUT /api/users/password (password update)
    - [x] GET /api/users/stats (project/task statistics)
    - [x] DELETE /api/users/account (account deletion)

- [x] ✅ **Basic CRUD operations ve infrastructure**
  - [x] Kapsamlı Zod validation schemas (register, login, profile, settings, etc.)
  - [x] Centralized error handling middleware (Prisma errors, custom errors)
  - [x] Service layer architecture (AuthService, UserService)
  - [x] Controller layer (AuthController, UserController)
  - [x] Route organization (auth.routes, user.routes, index.routes)
  - [x] Type definitions (API responses, request types, custom errors)
  - [x] Async error handling wrapper
  - [x] ✅ **Database connection testing** (SQLite working)
  - [ ] 🔄 **API endpoint testing** (test-api.http file ready)

### **Faz 2: Core Features (Hafta 3-4) - ⏸️ BEKLIYOR**
- [ ] **Project management API**
  - [ ] Project CRUD endpoints (create, read, update, delete)
  - [ ] Team member management (add/remove members)
  - [ ] Project status tracking

- [ ] **Sprint management**
  - [ ] Sprint CRUD endpoints
  - [ ] Sprint lifecycle management (planning → active → completed)
  - [ ] Sprint retrospective endpoints

- [ ] **Task management**
  - [ ] Task CRUD endpoints
  - [ ] Subtask management
  - [ ] Task status transitions
  - [ ] Task assignment ve deadline tracking

- [ ] **Team collaboration features**
  - [ ] Team member roles (leader, developer, member)
  - [ ] Permission-based access control
  - [ ] Activity logging

- [x] ✅ **Basic validation ve error handling**
  - [x] Comprehensive Zod validation schemas
  - [x] Centralized error handler middleware
  - [x] Prisma error handling

### **Faz 3: AI Integration (Hafta 5-6) - ⏸️ BEKLIYOR**
- [ ] **Gemini AI service integration**
  - [ ] Google Gemini API client setup
  - [ ] AI service wrapper ve error handling
  - [ ] Usage tracking ve subscription limits

- [ ] **AI task suggestions**
  - [ ] POST /api/ai/task-suggestions
  - [ ] Context-aware task breakdown
  - [ ] Sprint planning AI assistance

- [ ] **Chat functionality**
  - [ ] POST /api/ai/chat
  - [ ] Conversation context management
  - [ ] AI coaching responses

- [ ] **AI analytics features**
  - [ ] Sprint retrospective AI analysis
  - [ ] Progress tracking insights
  - [ ] Educational content suggestions

- [ ] **Usage tracking ve limits**
  - [ ] AI usage monitoring per user
  - [ ] Subscription-based rate limiting
  - [ ] Usage analytics dashboard

### **Faz 4: Advanced Features (Hafta 7-8) - ⏸️ BEKLIYOR**
- [ ] **Real-time notifications (Socket.io)**
  - [ ] WebSocket server setup
  - [ ] Real-time task updates
  - [ ] Team collaboration notifications

- [ ] **Email notifications**
  - [ ] SMTP service integration
  - [ ] Email templates
  - [ ] Notification preferences

- [ ] **File upload handling**
  - [ ] Multer middleware setup
  - [ ] AWS S3/CloudFlare R2 integration
  - [ ] File validation ve security

- [ ] **Analytics ve reporting**
  - [ ] Velocity tracking endpoints
  - [ ] Burndown chart data
  - [ ] Sprint reports

- [ ] **Subscription management**
  - [ ] Stripe integration
  - [ ] Plan upgrade/downgrade
  - [ ] Payment webhook handling

### **Faz 5: Performance & Security (Hafta 9-10) - ⏸️ BEKLIYOR**
- [ ] **Caching implementation**
  - [x] Redis client setup
  - [ ] API response caching
  - [ ] Database query optimization

- [ ] **Security hardening**
  - [x] Helmet.js integration
  - [x] CORS configuration
  - [ ] Security audit ve penetration testing

- [ ] **Performance optimization**
  - [ ] Database indexing
  - [ ] Query optimization
  - [ ] API response compression

- [ ] **Load testing**
  - [ ] Artillery/K6 test scenarios
  - [ ] Performance benchmarking
  - [ ] Bottleneck identification

- [ ] **API documentation**
  - [ ] OpenAPI/Swagger setup
  - [ ] Interactive API docs
  - [ ] Endpoint examples

### **Faz 6: Testing & Deployment (Hafta 11-12) - ⏸️ BEKLIYOR**
- [ ] **Unit test yazma**
  - [ ] Jest test setup
  - [ ] Service layer tests
  - [ ] Utility function tests

- [ ] **Integration testing**
  - [ ] API endpoint tests
  - [ ] Database integration tests
  - [ ] Authentication flow tests

- [ ] **Docker containerization**
  - [ ] Dockerfile optimization
  - [ ] Docker-compose for development
  - [ ] Multi-stage builds

- [ ] **CI/CD pipeline setup**
  - [ ] GitHub Actions workflow
  - [ ] Automated testing
  - [ ] Deployment automation

- [ ] **Production deployment**
  - [ ] Production environment setup
  - [ ] Monitoring ve logging
  - [ ] Health checks

---

### 🎯 **Şu Anki Öncelikler (Faz 1 Son Adımlar)**
1. **🔄 Database server setup (SQLite/PostgreSQL) ve migration çalıştırma**
2. **🔄 API endpoint testing (Postman/Thunder Client)**
3. **🔄 Seed data ekleme ve test kullanıcıları oluşturma**
4. **✅ Auth endpoints oluşturma** - TAMAMLANDI
5. **✅ User management endpoints** - TAMAMLANDI

### 📊 **Faz 1 İlerleme Özeti - %90 TAMAMLANDI**
- ✅ **TAMAMLANAN** (Infrastructure + API): 
  - Complete backend infrastructure setup
  - Authentication & authorization system
  - User management API (11 endpoints)
  - Validation & error handling
  - Service & controller architecture
  - Database schema design
- 🔄 **SON ADIMLAR** (Database + Testing):
  - Database server kurulumu ve migration
  - API endpoint testing
  - Production-ready deployment preparation
- ⏸️ **SONRAKI FAZLAR**: Project/Sprint/Task APIs, AI integration, real-time features

### 🏆 **Faz 1 Başarı Kriterleri**
- [x] ✅ Complete auth flow (register → login → profile management)
- [x] ✅ User management with settings, badges, notifications
- [x] ✅ Subscription-based rate limiting
- [x] ✅ TypeScript + Prisma + Express architecture
- [x] ✅ Working database with sample data (SQLite + seed data)
- [ ] 🔄 All endpoints tested and functional (ready for testing)

## 🛠️ Kurulum ve Geliştirme Rehberi

### **1. Gereksinimler**
```bash
node --version  # v18+
npm --version   # v9+
docker --version
```

### **2. Proje Kurulumu**
```bash
mkdir scrum-coach-backend
cd scrum-coach-backend
npm init -y
npm install express typescript prisma @types/node
npx tsc --init
```

### **3. Bağımlılıklar**
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "prisma": "^5.0.0",
    "@prisma/client": "^5.0.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.0",
    "zod": "^3.21.4",
    "@google/genai": "^0.1.3",
    "socket.io": "^4.7.0",
    "redis": "^4.6.0",
    "nodemailer": "^6.9.0",
    "multer": "^1.4.5",
    "helmet": "^7.0.0",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "@types/express": "^4.17.17",
    "@types/bcryptjs": "^2.4.2",
    "@types/jsonwebtoken": "^9.0.2",
    "@types/multer": "^1.4.7",
    "jest": "^29.5.0",
    "supertest": "^6.3.0",
    "nodemon": "^3.0.0"
  }
}
```

## 🎯 Kritik Başarı Faktörleri

### **1. Teknik Kalite**
- ✅ Type safety (TypeScript)
- ✅ Comprehensive error handling
- ✅ API documentation
- ✅ Test coverage > 80%

### **2. Performans**
- ✅ API response time < 200ms
- ✅ Database query optimization
- ✅ Effective caching strategy
- ✅ Scalable architecture

### **3. Güvenlik**
- ✅ Security best practices
- ✅ Data encryption
- ✅ Rate limiting
- ✅ Input validation

### **4. Kullanıcı Deneyimi**
- ✅ Real-time updates
- ✅ Offline capability consideration
- ✅ Error messages
- ✅ Fast AI responses

---

**Proje Hedefi:** 12 hafta içinde production-ready, ölçeklenebilir ve güvenli bir backend API sistemi geliştirmek.

**Estimated Effort:** ~480 saat geliştirme (40 saat/hafta × 12 hafta)

**Team Structure Önerisi:** 1 Senior Backend Developer + 1 DevOps Engineer (part-time)
