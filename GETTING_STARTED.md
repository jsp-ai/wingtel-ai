# Getting Started with Wingtel MVNO Platform

Welcome to the Wingtel AI-enhanced MVNO operations platform! This guide will help you set up a working demo that can evolve into a production system.

## 🎯 What You'll Build

A complete MVNO operations platform featuring:
- **Real subscriber data**: 200+ HomeFi customer records
- **AI-powered insights**: Natural language queries and predictive analytics
- **Modern architecture**: NestJS backend, React frontend, Python AI services
- **Production-ready infrastructure**: Docker, PostgreSQL, Redis, Vector DB

## 📋 Prerequisites

Before starting, ensure you have:

- **Node.js** 18+ and npm
- **Docker** and Docker Compose
- **Git** for version control
- **Supabase account** (free tier works)
- **OpenAI API key** (optional, for enhanced AI features)

## 🚀 Quick Start (5 minutes)

### 1. Validate Your Environment
```bash
# Run the setup validator
npm run setup

# If any issues are found, follow the suggested fixes
```

### 2. Configure Environment
```bash
# Copy environment template
npm run setup:env

# Edit .env with your actual values (minimum required):
# - SUPABASE_URL=https://your-project.supabase.co
# - SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
# - DATABASE_URL=postgresql://postgres:your-password@db.your-project.supabase.co:5432/postgres
```

### 3. Install Dependencies
```bash
# Install all project dependencies
npm run setup:deps
```

### 4. Start the Platform
```bash
# Start all services (database, backend, frontend, AI)
npm run dev

# Watch the logs
npm run dev:logs
```

### 5. Import Demo Data
```bash
# Import 200+ subscriber records and generate demo scenarios
npm run demo:setup
```

### 6. Access the Platform
- **Frontend Dashboard**: http://localhost:3001
- **Backend API**: http://localhost:3000/api/docs
- **AI Services**: http://localhost:8000/docs
- **Database Admin**: http://localhost:8080 (pgAdmin)

## 🎪 Demo Features

### Subscriber Management
- View 200+ real HomeFi subscribers
- Manage plans, accounts, and billing
- Track usage and performance metrics

### AI-Powered Analytics
- **Churn Prediction**: "Show me subscribers at risk of churning"
- **Revenue Optimization**: "Find revenue upgrade opportunities" 
- **Usage Anomalies**: "Detect unusual usage patterns"
- **Network Intelligence**: "Analyze network performance"
- **Proactive Support**: "Find customers needing assistance"

### Real-Time Insights
- Natural language query interface
- Predictive analytics dashboard
- Revenue optimization recommendations
- Automated alert system

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend │    │  NestJS Backend │    │ Python AI Layer│
│   (Port 3001)   │────│   (Port 3000)   │────│   (Port 8000)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                ┌────────────────────────────────┐
                │         Infrastructure         │
                │  PostgreSQL │ Redis │ Vector   │
                │    (5432)   │ (6379)│   DB     │
                └────────────────────────────────┘
```

### Technology Stack

**Frontend**
- React 18 with TypeScript
- Material-UI components
- React Query for data fetching
- Zustand for state management

**Backend**
- NestJS with TypeScript
- TypeORM for database
- Redis for caching
- JWT authentication
- Swagger API documentation

**AI Services**
- FastAPI with Python
- OpenAI/Anthropic integration
- LangChain for AI workflows
- Vector embeddings for search

**Infrastructure**
- PostgreSQL for primary data
- Redis for caching/sessions
- pgVector for AI embeddings
- Docker for containerization

## 📊 Demo Scenarios

The platform includes 5 compelling AI scenarios:

### 1. Churn Prediction
- Identifies 12 high-risk subscribers
- $2,840 revenue at risk
- Automated intervention recommendations

### 2. Revenue Optimization  
- 18 parking plan upgrade candidates
- $2,400 monthly revenue opportunity
- Targeted campaign suggestions

### 3. Usage Anomaly Detection
- Real customer examples (Vernon Stanton)
- Unusual pattern identification
- Proactive monitoring alerts

### 4. Network Performance Intelligence
- Coverage optimization insights
- Performance trending
- Capacity planning recommendations

### 5. Proactive Customer Support
- Onboarding optimization
- Issue prevention strategies
- Customer satisfaction improvements

## 🛠️ Development Workflow

### Starting Development
```bash
# Start all services in development mode
npm run dev

# View real-time logs
npm run dev:logs

# Run health checks
npm run health
```

### Making Changes

**Backend Changes**
```bash
# Backend auto-reloads on file changes
cd backend
npm run start:dev
```

**Frontend Changes**
```bash
# Frontend hot-reloads automatically
cd frontend
npm run dev
```

**AI Services Changes**
```bash
# AI services auto-reload with uvicorn
cd ai-services
uvicorn main:app --reload
```

### Running Tests
```bash
# Run all tests
npm run test

# Backend tests only
npm run test:backend

# Frontend tests only  
npm run test:frontend

# End-to-end tests
npm run test:e2e
```

## 📈 From Demo to Production

### Phase 1: Enhanced Demo (Week 1)
- Complete all 5 AI scenarios
- Real-time dashboard updates
- Enhanced UI/UX polish
- CEO presentation ready

### Phase 2: Production Features (Week 2-3)
- Carrier API integrations (Verizon)
- Advanced billing engine
- Multi-tenant architecture
- Security hardening

### Phase 3: Enterprise Scale (Week 4-6)
- Performance optimization
- Monitoring and alerting
- Backup and disaster recovery
- Customer portal

### Production Deployment

```bash
# Build for production
npm run build

# Deploy to staging
npm run deploy:staging

# Deploy to production
npm run deploy:prod
```

## 🔧 Troubleshooting

### Common Issues

**Environment Variables**
- Ensure all required vars are set in `.env`
- Check Supabase credentials are correct
- Verify database connection string

**Docker Issues**
```bash
# Clean restart
npm run dev:clean
npm run dev

# Check service status
docker-compose ps

# View specific service logs
docker-compose logs backend
```

**Database Connection**
```bash
# Test database connectivity
npm run health:db

# Reset database if needed
npm run db:reset
```

**Port Conflicts**
- Frontend: 3001
- Backend: 3000  
- AI Services: 8000
- Database: 5432
- Redis: 6379
- pgAdmin: 8080

### Getting Help

1. **Check the logs**: `npm run dev:logs`
2. **Validate setup**: `npm run setup`
3. **Review documentation**: Each service has `/docs` endpoint
4. **Check GitHub issues**: Common problems and solutions

## 🎯 Next Steps

1. **Run the demo**: Follow the quick start guide
2. **Explore AI features**: Try natural language queries
3. **Review the data**: Examine real subscriber records
4. **Plan production**: Review the development roadmap
5. **Customize**: Adapt for your specific MVNO needs

## 💡 Pro Tips

- Use `npm run setup` to validate your environment anytime
- The AI responds to natural language - try "Show me revenue opportunities"
- Real customer data makes demos more compelling than mock data
- Each service has comprehensive API documentation
- Docker Compose handles all the infrastructure complexity

---

**Ready to revolutionize MVNO operations with AI?** 🚀

Start with `npm run setup` and you'll have a working demo in minutes! 