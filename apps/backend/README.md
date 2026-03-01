# 🚀 Central Backend MVP - Testing Project Generator

## Backend Repository - Thesis Project

## Author: Bryan Enrique Garay Benavidez

## 📋 Project Description

This is the **generation engine** of a complete automated testing system. Its purpose is to automatically create Playwright + BDD testing projects in TypeScript from a simple configuration.

## 🏗️ MVP Architecture

![MVP Architecture](arquitectura.png)

### Diagram Components

- **Public Frontend**
  - *Technologies*: Landing Page (React + TypeScript, AWS Amplify)
  - *Description*: Web portal that brings together documentation, downloads, and support resources, facilitating access and adoption of the solution from any environment.

- **Admin Dashboard**
  - *Technologies*: Private dashboard (React + TypeScript, AWS Amplify, Cognito)
  - *Description*: Exclusive panel for administration and monitoring, with restricted access for the owner, enabling operational adjustments and centralized system control.

- **Local User Environment**
  - *Technologies*: Local dashboard (React + TypeScript), Local backend (NestJS + TypeScript), Git repository
  - *Description*: Environment running on the user's machine to manage tests, configurations, and versioning, maintaining full privacy and control of data.

- **AI Service**
  - *Technologies*: OpenAI API (fine-tuned model)
  - *Description*: External service that generates and edits test cases from natural language, integrating advanced automation capabilities without exposing sensitive data.

- **Cloud Backend**
  - *Technologies*: REST API (AWS Lambda + NestJS + TypeScript), RDS (PostgreSQL), Secrets Manager, CloudWatch, S3
  - *Description*: Serverless core that processes AI requests, manages users, stores metrics and logs, protects credentials, and securely and scalably manages large files.

### Main tools, versions and libraries

- **Frontend (React + TypeScript)**
  - Libraries: React 18+, TypeScript 4+, AWS Amplify for deployment and hosting, integration with AWS Cognito for authentication.
  - Documentation and download tools integrated into the landing page.

- **Admin Dashboard**
  - React 18+, TypeScript, AWS Amplify, AWS Cognito for authentication and access control.

- **Local Backend (NestJS + TypeScript)**
  - NestJS 9+, TypeScript 4+, TypeORM for local persistence (SQLite in MVP), validation and logging middlewares.
  - JWT authentication (planned for future phases), project management and endpoints via REST API.

- **Git Repository**
  - Local/remote Git for versioning and change control of generated projects.

- **AI Service**
  - OpenAI API (fine-tuned models, REST integration), no storage of sensitive data in the cloud.

- **Cloud Backend (Serverless)**
  - AWS Lambda (Node.js 18+), NestJS, PostgreSQL (AWS RDS), AWS Secrets Manager for credential management, AWS CloudWatch for logs and metrics, AWS S3 for large file storage.
  - Security, validation and logging middlewares.
  - Authentication and authorization via API Keys and AWS Cognito.

---

## 📋 Requirements

- **Node.js** (version 18 or higher)
- **npm** (included with Node.js)

## 🎯 Purpose of this MVP

This is the **generation engine** of the complete system. It focuses on creating testing projects automatically from a simple configuration.

**Why direct installation?**
- This MVP is designed to run **locally** where projects will be generated
- It generates files, installs dependencies, and runs npm/playwright commands
- In containers it would be costly and complex to manage multiple dependency installations
- The part that will go to the cloud (with AI) will be a separate later phase

## 🚀 Installation and Running

### Method 1: Direct Installation with Node.js (⭐ RECOMMENDED)

This is the recommended method for this generation engine MVP.

#### 1. Clone the Repository
```bash
git clone https://github.com/BryanGaray99/central-backend-mvp.git
cd central-backend-mvp
```

#### 2. Configure Environment Variables
```bash
# Copy the example file
cp .env.example .env

# Edit variables according to your setup
# Especially important:
# - PORT: Server port (default: 3000)
# - DATABASE_PATH: SQLite database path
# - PLAYWRIGHT_WORKSPACES_PATH: Path for generated workspaces
```

#### 3. Install Dependencies
```bash
npm install
```

#### 4. Run the Server
```bash
npm run start:dev
```

#### 5. Verify It Works
- **API**: http://localhost:3000
- **Documentation**: http://localhost:3000/docs
- **Health Check**: http://localhost:3000/v1/api/health

### ⚠️ .env File Configuration

Make sure your `.env` file contains the following variables as in the `.env.example`:

```env
# Server port
PORT=3000

# SQLite database path
DATABASE_PATH=central-backend.sqlite

# Path where Playwright workspaces will be created
PLAYWRIGHT_WORKSPACES_PATH=../playwright-workspaces

# Logging level
LOG_LEVEL=debug

# JWT secret key (for future integrations)
JWT_SECRET=your-secret-key

# API Key (for future security integrations)
API_KEY=your-api-key

# Generation configuration
OVERRIDE_EXISTING=false

# Path to base template directory
TEMPLATE_DIR=../e-commerce.playwright-testing-model
```

### Method 2: With Docker (Development/testing only)

⚠️ **Note**: Docker is configured for convenience, but the recommended approach is to install and run the backend locally, since this MVP is the part of the solution that is intended to run on the user's machine.

```bash
docker-compose up --build
```

### 🎯 What Does This MVP Do?

1. **Generates complete projects** for testing with Playwright + Cucumber
2. **Automatically installs** all required dependencies
3. **Creates the standard folder structure** for BDD
4. **Generates configuration files** (playwright.config.ts, cucumber.cjs, etc.)
5. **Runs health checks** to validate that everything works
6. **Manages endpoints** to analyze APIs and generate testing artifacts

### 🏗️ Complete System Architecture

This MVP is the **first part** of a larger system:

```
┌─────────────────────────────────────────────────────────────┐
│                    COMPLETE SYSTEM                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   AI Backend - Later Phase                                  │
│  ├── Runs in the cloud with Docker                          │
│  ├── Receives requests in natural language                  │
│  ├── Translates to generation JSON                          │
│  └── Communicates with this local engine                    │
│                                                             │
│  Generation Engine (This MVP)                               │
│  ├── Runs locally                                           │
│  ├── Generates testing projects                             │
│  ├── Installs dependencies                                  │
│  └── Validates that everything works                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 📊 Current MVP Status

### ✅ **Completed**
- ✅ NestJS backend with TypeORM and SQLite
- ✅ Automatic port detection system (3000, 3001, 3002)
- ✅ Playwright + BDD project generation
- ✅ Automatic dependency installation
- ✅ Robust health checks
- ✅ Queue system for asynchronous generation
- ✅ Automatic cleanup on failure
- ✅ Isolated workspace management
- ✅ Complete REST API with Swagger
- ✅ Input validation and error handling
- ✅ Endpoints module for API analysis

### 🔄 **In Development**
- 🔄 Testing artifact generation (features, steps, fixtures)
- 🔄 Automatic API endpoint analysis
- 🔄 Generated project validation

### 📋 **Next Steps**
- 📋 Specific test case module
- 📋 Execution and reporting system
- 📋 AI backend integration (later phase)


## 📚 Available Endpoints

### Projects
- `POST /projects` - Create project
- `GET /projects` - List projects
- `GET /projects/:id` - Get project
- `PUT /projects/:id` - Update project
- `DELETE /projects/:id` - Delete project

### Endpoints
- `POST /endpoints/register` - Register and analyze endpoint
- `GET /endpoints/:projectId` - List endpoints for a project
- `PUT /endpoints/:id` - Update endpoint
- `DELETE /endpoints/:id` - Delete endpoint

### Test Cases
- `POST /test-cases` - Create test case
- `GET /test-cases` - List test cases
- `GET /test-cases/:id` - Get test case
- `PUT /test-cases/:id` - Update test case
- `DELETE /test-cases/:id` - Delete test case
- `POST /test-cases/:id/duplicate` - Duplicate test case
- `GET /test-cases/:id/export` - Export test case

### Test Steps
- `POST /test-cases/steps` - Create step template
- `GET /test-cases/steps` - List step templates
- `GET /test-cases/steps/:id` - Get step template
- `PUT /test-cases/steps/:id` - Update step template
- `DELETE /test-cases/steps/:id` - Delete step template

### Test Execution
- `POST /test-execution/execute` - Execute tests
- `GET /test-execution/status` - Get execution status
- `GET /test-execution/results` - Get results
- `POST /test-execution/stop` - Stop execution
- `GET /test-execution/history` - Execution history

## 🧪 Testing the API

### Create a Project
```bash
curl -X POST http://localhost:3000/projects \
-H "Content-Type: application/json" \
-d '{
  "name": "my-test-project",
  "displayName": "My Testing Project",
  "baseUrl": "http://localhost:3004",
  "metadata": {
    "author": "Your Name",
    "description": "Test project"
  }
}'
```

### List Projects
```bash
curl http://localhost:3000/projects
```

### Verify Health
```bash
curl http://localhost:3000/health
```

## 🛠️ Available Scripts

```bash
npm run start:dev    # Development (hot reload)
npm run build        # Build for production
npm run start:prod   # Run in production
npm run test         # Run tests
```

## 🛠️ Troubleshooting

### Port in use
The system automatically tries ports 3000, 3001, and 3002. If all are in use, you can specify manually:
```bash
PORT=3003 npm run start:dev
```

### Dependency issues
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Corrupted database
```bash
rm central-backend.sqlite
npm run start:dev
```

### Optional configuration with .env
If you want to customize the configuration, you can create an `.env` file:
```bash
# Create .env file (optional)
cp .env.example .env

# Edit variables according to your needs
nano .env  # or use your preferred editor
```

### Available environment variables
If you create an `.env` file, you can configure these variables:
- `PORT`: Server port (default: 3000)
- `PLAYWRIGHT_WORKSPACES_PATH`: Path for workspaces (default: ../playwright-workspaces)
- `LOG_LEVEL`: Logging level (default: debug)
- `JWT_SECRET`: JWT secret key (default: your-secret-key)
- `API_KEY`: API Key for security (default: your-api-key)

## 📁 Structure

```
src/
├── modules/
│   ├── projects/     # Project management
│   ├── endpoints/    # Endpoint management
│   └── workspace/    # Workspace management
├── common/           # Common utilities
└── main.ts          # Entry point
```

## 📝 Important Notes

- **Local Execution**: This MVP is designed to run locally where projects will be generated
- **Database**: SQLite is created automatically at path `../playwright-workspaces/central-backend.sqlite`
- **Workspaces**: Generated at path `../playwright-workspaces` by default
- **Documentation**: Swagger UI available at `/docs`
- **Configuration**: The project works without an `.env` file using default values
- **Optional variables**: You can create an `.env` file to customize the configuration

## 🔮 Future Architecture

This MVP is only the first part of the complete system:

1. **Generation Engine** (this MVP) - Runs locally
2. **AI Backend** (later phase) - Runs in the cloud with Docker
   - Handles natural language requests
   - Translates descriptions to generation JSON
   - Communicates with this local engine

---

**Done! The server will be running at http://localhost:3000**
