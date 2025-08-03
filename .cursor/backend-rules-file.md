# Kişisel Scrum Koçu AI - Backend Development Rules & Guidelines

## 🎯 Project Overview
This is the backend API for a personal Scrum coaching application with AI integration. The system manages projects, sprints, tasks, team collaboration, and provides AI-powered insights and suggestions.

## 🏗️ Architecture Principles

### 1. **Tech Stack Requirements**
- **Runtime**: Node.js v18+ with TypeScript
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL 15+ with Prisma ORM
- **Cache**: Redis for sessions and API caching
- **AI**: Google Gemini API integration
- **Real-time**: Socket.io for live updates
- **Authentication**: JWT with refresh tokens

### 2. **Project Structure Standards**
```
src/
├── controllers/     # HTTP request handlers
├── services/        # Business logic layer
├── models/          # Database models & types
├── middleware/      # Custom middleware
├── routes/          # API route definitions
├── utils/           # Helper functions
├── config/          # Configuration files
├── sockets/         # WebSocket handlers
└── types/           # TypeScript type definitions
```

## 📝 Coding Standards

### 1. **TypeScript Guidelines**
- Use strict TypeScript configuration
- Define interfaces for all data structures
- Use proper generic types for reusable functions
- Avoid `any` type - use `unknown` when necessary
- Export types from dedicated type files

```typescript
// Good
interface CreateTaskRequest {
  title: string;
  description?: string;
  sprintId: string;
  storyPoints?: number;
}

// Bad
function createTask(data: any) { ... }
```

### 2. **Error Handling**
- Use custom error classes with proper HTTP status codes
- Implement centralized error handling middleware
- Log errors with proper context and stack traces
- Return consistent error response format

```typescript
class ValidationError extends Error {
  constructor(message: string, public field: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Error response format
{
  success: false,
  error: {
    type: 'VALIDATION_ERROR',
    message: 'Invalid email format',
    field: 'email'
  }
}
```

### 3. **API Response Standards**
- Use consistent response format for all endpoints
- Include proper HTTP status codes
- Implement pagination for list endpoints
- Use camelCase for JSON responses

```typescript
// Success response
{
  success: true,
  data: { ... },
  meta?: { 
    pagination: { page, limit, total, pages },
    timestamp: string
  }
}

// Error response
{
  success: false,
  error: {
    type: string,
    message: string,
    details?: any
  }
}
```

## 🔒 Security Requirements

### 1. **Authentication & Authorization**
- Implement JWT with access/refresh token pattern
- Use bcrypt for password hashing (salt rounds: 12)
- Validate JWT tokens on protected routes
- Implement role-based access control (RBAC)

### 2. **Input Validation**
- Use Zod for request validation
- Sanitize all user inputs
- Validate file uploads (type, size limits)
- Prevent SQL injection (use Prisma ORM)

### 3. **Rate Limiting**
- Global rate limit: 100 requests/minute per IP
- AI endpoints: Based on subscription tier
- Authentication endpoints: 5 attempts/minute
- File upload: 10 uploads/minute

```typescript
// Rate limiting configuration
const RATE_LIMITS = {
  global: { windowMs: 60000, max: 100 },
  auth: { windowMs: 60000, max: 5 },
  ai: {
    free: { windowMs: 86400000, max: 10 },    // 10/day
    pro: { windowMs: 86400000, max: 1000 },   // 1000/day
    enterprise: { windowMs: 86400000, max: -1 } // unlimited
  }
};
```

## 🗄️ Database Guidelines

### 1. **Prisma Schema Rules**
- Use UUID for all primary keys
- Include createdAt/updatedAt timestamps
- Use proper foreign key relationships
- Define enums for status fields

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Relations
  projects Project[]
  tasks    Task[]
}
```

### 2. **Query Optimization**
- Use database indexes for frequently queried fields
- Implement proper pagination
- Use select/include for optimized queries
- Avoid N+1 query problems

### 3. **Migration Standards**
- Write descriptive migration names
- Never modify existing migrations
- Include rollback instructions
- Test migrations on staging environment

## 🤖 AI Integration Rules

### 1. **Gemini API Guidelines**
- Store API keys in environment variables
- Implement proper error handling for AI requests
- Cache AI responses when appropriate (Redis TTL: 1 hour)
- Track AI usage per user/subscription tier

### 2. **AI Feature Implementation**
```typescript
// AI service structure
class AIService {
  async generateTaskSuggestions(context: ProjectContext): Promise<TaskSuggestion[]>
  async analyzeSprintProgress(sprintData: SprintData): Promise<SprintAnalysis>
  async generateRetrospective(sprintHistory: SprintHistory): Promise<Retrospective>
  async chatWithCoach(message: string, context: UserContext): Promise<ChatResponse>
}
```

### 3. **AI Rate Limiting**
- Track usage in database
- Reset counters based on subscription billing cycle
- Graceful degradation when limits exceeded
- Clear error messages for limit violations

## 🔄 Real-time Features

### 1. **Socket.io Implementation**
- Use JWT authentication for socket connections
- Implement room-based messaging for team projects
- Handle connection/disconnection events properly
- Emit events for real-time updates

```typescript
// Socket event types
interface SocketEvents {
  'task:updated': (data: TaskUpdateEvent) => void;
  'notification:new': (data: NotificationEvent) => void;
  'chat:message': (data: ChatMessageEvent) => void;
  'sprint:status_changed': (data: SprintStatusEvent) => void;
}
```

### 2. **Event Naming Convention**
- Use namespace:action format (e.g., `task:created`)
- Include relevant IDs in event data
- Send minimal data, fetch details if needed
- Handle offline users gracefully

## 📊 Performance Standards

### 1. **Response Time Requirements**
- Authentication endpoints: < 500ms
- CRUD operations: < 200ms
- AI endpoints: < 5 seconds
- File uploads: Based on file size

### 2. **Caching Strategy**
```typescript
// Cache TTL configuration
const CACHE_TTL = {
  userProfile: 15 * 60,      // 15 minutes
  projectData: 10 * 60,      // 10 minutes
  aiResponses: 60 * 60,      // 1 hour
  analytics: 30 * 60,        // 30 minutes
};
```

### 3. **Database Performance**
- Use connection pooling
- Implement query timeouts
- Monitor slow queries
- Regular database maintenance

## 🧪 Testing Requirements

### 1. **Test Coverage**
- Minimum 80% code coverage
- Unit tests for all services
- Integration tests for API endpoints
- E2E tests for critical user flows

### 2. **Test Structure**
```typescript
describe('ProjectController', () => {
  describe('POST /projects', () => {
    it('should create project with valid data', async () => {
      // Arrange, Act, Assert
    });
    
    it('should return 400 for invalid data', async () => {
      // Test validation
    });
    
    it('should require authentication', async () => {
      // Test auth requirement
    });
  });
});
```

## 📝 API Documentation

### 1. **OpenAPI/Swagger Standards**
- Document all endpoints with proper schemas
- Include request/response examples
- Document authentication requirements
- Provide error response examples

### 2. **Endpoint Documentation Format**
```yaml
/api/projects:
  post:
    summary: Create new project
    tags: [Projects]
    security:
      - BearerAuth: []
    requestBody:
      required: true
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/CreateProjectRequest'
    responses:
      201:
        description: Project created successfully
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ProjectResponse'
```

## 🚀 Deployment Guidelines

### 1. **Environment Configuration**
```bash
# Required environment variables
NODE_ENV=production
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
JWT_SECRET=...
GEMINI_API_KEY=...
SMTP_HOST=...
SMTP_USER=...
SMTP_PASS=...
```

### 2. **Docker Configuration**
- Use multi-stage builds
- Optimize image size
- Include health checks
- Proper volume mounting for logs

### 3. **CI/CD Pipeline**
- Run tests on all PRs
- Build and push Docker images
- Automated deployment to staging
- Manual approval for production

## 📋 Development Workflow

### 1. **Git Workflow**
- Use feature branches for new development
- Meaningful commit messages
- Squash commits before merging
- Code review required for all PRs

### 2. **Branch Naming**
```
feature/task-management-api
bugfix/auth-token-expiry
hotfix/critical-security-issue
refactor/database-schema-optimization
```

### 3. **Commit Message Format**
```
feat: add AI task suggestion endpoint
fix: resolve JWT token validation issue
docs: update API documentation
refactor: optimize database queries
test: add integration tests for sprint API
```

## 🔍 Monitoring & Logging

### 1. **Logging Standards**
- Use structured logging (JSON format)
- Include request IDs for tracing
- Log levels: ERROR, WARN, INFO, DEBUG
- Never log sensitive data (passwords, tokens)

```typescript
logger.info('User authenticated', {
  userId: user.id,
  email: user.email,
  requestId: req.id,
  timestamp: new Date().toISOString()
});
```

### 2. **Metrics Tracking**
- API response times
- Error rates by endpoint
- AI usage by subscription tier
- Database query performance

## ⚠️ Common Pitfalls to Avoid

1. **Security Issues**
   - Don't expose sensitive data in logs
   - Always validate and sanitize inputs
   - Use HTTPS in production
   - Implement proper CORS policies

2. **Performance Problems**
   - Avoid N+1 database queries
   - Don't fetch unnecessary data
   - Implement proper pagination
   - Use database transactions appropriately

3. **Code Quality**
   - Don't ignore TypeScript errors
   - Avoid deep nesting in functions
   - Use meaningful variable names
   - Keep functions small and focused

## 📚 Recommended Libraries

### Core Dependencies
```json
{
  "express": "^4.18.2",
  "prisma": "^5.0.0",
  "@prisma/client": "^5.0.0",
  "jsonwebtoken": "^9.0.0",
  "bcryptjs": "^2.4.3",
  "zod": "^3.21.4",
  "socket.io": "^4.7.0",
  "redis": "^4.6.0",
  "@google/genai": "^0.1.3"
}
```

### Development Dependencies
```json
{
  "@types/express": "^4.17.17",
  "@types/jsonwebtoken": "^9.0.2",
  "jest": "^29.5.0",
  "supertest": "^6.3.0",
  "swagger-jsdoc": "^6.2.8",
  "swagger-ui-express": "^4.6.3"
}
```

---

## 🎯 Success Metrics

### Technical KPIs
- API response time < 200ms (95th percentile)
- 99.9% uptime
- Zero security vulnerabilities
- 80%+ test coverage

### Business KPIs
- AI feature adoption rate
- User engagement metrics
- Subscription conversion rate
- Feature usage analytics

**Remember**: These rules are guidelines to ensure code quality, security, and maintainability. When in doubt, prioritize security and user experience over convenience.