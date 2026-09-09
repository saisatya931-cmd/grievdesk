# GrievDesk - Smart Complaint Resolution Framework

![GrievDesk](https://img.shields.io/badge/MERN%20Stack-2024-blue)
![License](https://img.shields.io/badge/License-MIT-green)
![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)

## 📚 Project Overview

**GrievDesk** is a comprehensive MERN stack web application designed to digitize and streamline the complaint management process in educational institutions. This system enables students to submit complaints, track their status, and administrators to efficiently manage and resolve complaints using AI-powered categorization and prioritization.

### Key Objectives

- **Digitize Complaint Management**: Replace manual processes with a centralized digital platform
- **Improve Transparency**: Enable students to track complaint status in real-time
- **Enhance Efficiency**: Automate complaint categorization and department assignment using AI
- **Streamline Operations**: Provide administrators with comprehensive tools for complaint management
- **Increase Accountability**: Maintain detailed complaint history and resolution documentation

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React + Vite)              │
│  - Responsive UI with Tailwind CSS                      │
│  - Real-time state management with Context API          │
│  - Framer Motion animations                             │
│  - Dark/Light theme support                             │
└──────────────────┬──────────────────────────────────────┘
                   │ Axios HTTP Requests
                   ▼
┌─────────────────────────────────────────────────────────┐
│                 Backend (Node + Express)                │
│  - RESTful API with JWT authentication                  │
│  - MongoDB database for data persistence                │
│  - Groq AI integration for smart analysis               │
│  - Role-based authorization                             │
│  - Email notifications                                  │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │   MongoDB Database   │
        │  - Users             │
        │  - Complaints        │
        │  - Departments       │
        │  - Notifications     │
        └──────────────────────┘
```

---

## 🛠️ Technology Stack

### Frontend
- **React 18**: Modern UI library
- **Vite**: Lightning-fast build tool
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Animation library
- **React Router DOM**: Client-side routing
- **Axios**: HTTP client
- **React Hook Form**: Form handling
- **Recharts**: Data visualization
- **Lucide React**: Icon library
- **React Hot Toast**: Toast notifications

### Backend
- **Node.js**: JavaScript runtime
- **Express.js**: Web framework
- **MongoDB**: NoSQL database
- **Mongoose**: MongoDB ODM
- **JWT**: Authentication
- **bcryptjs**: Password hashing
- **Groq AI API**: AI integration
- **Multer**: File uploads
- **Cors**: Cross-origin resource sharing
- **Helmet**: Security headers
- **Express Rate Limit**: API rate limiting
- **Morgan**: HTTP logging

---

## 📁 Project Structure

```
smart-complaint-resolution/
│
├── client/                          # React Frontend
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Toast.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── ui/
│   │   │       └── index.jsx        # Reusable UI components
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   ├── hooks/
│   │   │   └── useCustomHooks.js
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   └── NotFoundPage.jsx
│   │   ├── services/
│   │   │   └── api.js              # API service layer
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── .env.example
│   └── .gitignore
│
├── server/                          # Node + Express Backend
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── complaintController.js
│   │   ├── aiController.js
│   │   ├── departmentController.js
│   │   ├── userController.js
│   │   ├── notificationController.js
│   │   └── dashboardController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── errorHandler.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Complaint.js
│   │   ├── Department.js
│   │   └── Notification.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── complaintRoutes.js
│   │   ├── aiRoutes.js
│   │   ├── departmentRoutes.js
│   │   ├── userRoutes.js
│   │   ├── notificationRoutes.js
│   │   └── dashboardRoutes.js
│   ├── services/
│   │   ├── authService.js
│   │   ├── complaintService.js
│   │   └── aiService.js
│   ├── scripts/
│   │   └── seedAdmin.js
│   ├── uploads/
│   ├── app.js
│   ├── server.js
│   ├── package.json
│   ├── .env.example
│   └── .gitignore
│
├── README.md
└── .gitignore
```

---

## 🔐 Database Schemas

### User Model
```javascript
{
  name: String (required),
  email: String (unique, required),
  password: String (hashed, required),
  role: String (enum: ['student', 'admin']),
  studentId: String,
  department: String,
  phone: String,
  avatar: String,
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

### Complaint Model
```javascript
{
  complaintId: String (auto-generated),
  student: ObjectId (ref: User),
  studentName: String,
  studentEmail: String,
  title: String (required),
  description: String (required),
  category: String (enum: [...categories]),
  priority: String (enum: ['Low', 'Medium', 'High', 'Critical']),
  department: ObjectId (ref: Department),
  status: String (enum: ['Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved', 'Closed']),
  attachments: Array,
  aiAnalysis: {
    category: String,
    priority: String,
    summary: String,
    recommendedDepartment: String
  },
  adminRemarks: Array,
  resolution: {
    resolutionText: String,
    resolvedBy: ObjectId,
    resolvedAt: Date
  },
  statusHistory: Array,
  createdAt: Date,
  updatedAt: Date,
  resolvedAt: Date
}
```

### Department Model
```javascript
{
  name: String (unique, required),
  description: String,
  head: String,
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

### Notification Model
```javascript
{
  user: ObjectId (ref: User),
  title: String,
  message: String,
  type: String (enum: ['info', 'success', 'warning', 'error']),
  isRead: Boolean (default: false),
  relatedComplaint: ObjectId (ref: Complaint),
  createdAt: Date
}
```

---

## 🔌 REST API Documentation

### Authentication Endpoints
```
POST   /api/auth/register          - Register a new student
POST   /api/auth/login             - Login with email and password
POST   /api/auth/logout            - Logout user
GET    /api/auth/me                - Get current user (protected)
```

### Complaint Endpoints
```
POST   /api/complaints             - Create new complaint (student)
GET    /api/complaints             - Get all complaints (admin)
GET    /api/complaints/my          - Get student's complaints (student)
GET    /api/complaints/:id         - Get complaint details (protected)
PUT    /api/complaints/:id/status  - Update status (admin)
POST   /api/complaints/:id/remark  - Add remark (admin)
PUT    /api/complaints/:id/assign  - Assign department (admin)
PUT    /api/complaints/:id/priority - Update priority (admin)
PUT    /api/complaints/:id/resolve - Resolve complaint (admin)
```

### Department Endpoints
```
GET    /api/departments            - Get all departments (protected)
POST   /api/departments            - Create department (admin)
PUT    /api/departments/:id        - Update department (admin)
DELETE /api/departments/:id        - Delete department (admin)
```

### User Endpoints
```
GET    /api/users/profile          - Get user profile (protected)
PUT    /api/users/profile          - Update user profile (protected)
GET    /api/users                  - Get all users (admin)
PUT    /api/users/:id/status       - Update user status (admin)
```

### Notification Endpoints
```
GET    /api/notifications          - Get notifications (protected)
PUT    /api/notifications/:id/read - Mark as read (protected)
PUT    /api/notifications/read-all - Mark all as read (protected)
```

### AI Endpoints
```
POST   /api/ai/analyze             - Analyze complaint (protected)
POST   /api/ai/chat                - AI assistant chat (protected)
```

### Dashboard Endpoints
```
GET    /api/dashboard/student      - Get student dashboard (student)
GET    /api/dashboard/admin        - Get admin dashboard (admin)
GET    /api/dashboard/analytics    - Get analytics data (admin)
```

---

## 🤖 AI Integration Features

### Groq API Integration

The system uses **Groq API** with the `llama-3.1-8b-instant` model for AI-powered features:

#### 1. **Automatic Categorization**
- Analyzes complaint text and suggests appropriate category
- Categories: Academic, Examination, Faculty, Hostel, Canteen, Transport, Library, Infrastructure, Laboratory, Fees, Scholarship, IT/Technical, Administration, Other

#### 2. **Priority Detection**
- Assesses complaint severity automatically
- Levels: Low, Medium, High, Critical
- Administrators can override the AI suggestion

#### 3. **Complaint Summarization**
- Generates concise one-line summaries
- Helps administrators quickly understand issues

#### 4. **Department Recommendation**
- Recommends the best department to handle the complaint
- Can be overridden by administrators

#### 5. **AI Assistant**
- Interactive chatbot for student questions
- Helps with complaint submission guidance
- Explains platform features

### API Configuration
```javascript
// server/.env
GROQ_API_KEY=your_groq_api_key_here

// Never expose in frontend - handled server-side only
```

---

## 🔐 Security Implementation

### Authentication & Authorization
- **JWT-based authentication** with secure token storage
- **Password hashing** using bcryptjs (10 salt rounds)
- **Role-based authorization** (Student, Admin)
- **Protected routes** with middleware validation

### Security Headers
- **Helmet.js** for setting HTTP security headers
- **CORS** configured for trusted origins only
- **Rate limiting** to prevent abuse
- **Input validation** on frontend and backend
- **MongoDB injection prevention** with Mongoose validation

### Best Practices
- Secrets stored in `.env` (never in code)
- HTTPS-ready configuration
- Password minimum length enforcement
- Account status management
- Session-based logout
- Token expiration

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js 14+ and npm
- MongoDB Atlas account (or local MongoDB)
- Groq API key
- Git

### 1. Clone Repository
```bash
git clone <repository-url>
cd smart-complaint-resolution
```

### 2. Backend Setup

```bash
cd server

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your credentials
```

**Server .env Configuration:**
```
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/smart-complaint-resolution
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
GROQ_API_KEY=your_groq_api_key_here
MAX_FILE_SIZE=5242880
ADMIN_NAME=Administrator
ADMIN_EMAIL=admin@grievdesk.com
ADMIN_PASSWORD=Admin@123456
```

### 3. Frontend Setup

```bash
cd ../client

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with backend URL
```

**Client .env Configuration:**
```
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## 🚀 Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
# Server runs on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
# Frontend runs on http://localhost:5173
```

### MongoDB Connection
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get connection string
4. Add to `server/.env` as `MONGO_URI`

### Groq API Setup
1. Sign up at [Groq Console](https://console.groq.com)
2. Create API key
3. Add to `server/.env` as `GROQ_API_KEY`

---

## 👤 Creating Admin Account

```bash
cd server

# Run seed script
npm run seed:admin

# Uses credentials from .env:
# ADMIN_EMAIL=admin@grievdesk.com
# ADMIN_PASSWORD=Admin@123456
```

Or manually:
1. Register as a student at `/register`
2. Connect to MongoDB Atlas
3. Update role to 'admin' in database

---

## 🧪 Testing the Application

### Test Credentials

**Student Account:**
- Email: `student@example.com`
- Password: `password123`

**Admin Account:**
- Email: `admin@grievdesk.com`
- Password: `Admin@123456`

### Test Workflows

#### Student Workflow
1. Register/Login
2. Navigate to Dashboard
3. View statistics
4. Submit new complaint
5. View submitted complaints
6. Click complaint to see details
7. Track status changes
8. Check notifications
9. Use AI Assistant

#### Admin Workflow
1. Login with admin credentials
2. View Admin Dashboard with analytics
3. See complaint statistics and charts
4. View all complaints
5. Search/Filter complaints
6. Open complaint details
7. Assign department
8. Update status
9. Add remarks
10. Resolve complaints
11. View analytics
12. Manage users and departments

---

## 🏭 Production Build

### Frontend Build
```bash
cd client
npm run build
# Generates optimized files in dist/
npm run preview  # Preview production build
```

### Backend Production
```bash
cd server
npm start
# Runs on configured PORT (default 5000)
```

---

## 🌐 Deployment Guide

### Frontend Deployment (Vercel/Netlify)

**Vercel:**
1. Push code to GitHub
2. Connect repository to Vercel
3. Set `VITE_API_BASE_URL` to production backend URL
4. Deploy

**Environment Variables on Vercel:**
```
VITE_API_BASE_URL=https://your-backend.herokuapp.com/api
```

### Backend Deployment (Render/Railway)

**Render:**
1. Create account at [render.com](https://render.com)
2. Connect GitHub repository
3. Create new Web Service
4. Set environment variables:
   ```
   PORT=5000
   MONGO_URI=your_mongodb_atlas_uri
   JWT_SECRET=your_secret_key
   GROQ_API_KEY=your_groq_key
   CLIENT_URL=https://your-frontend-url.com
   ```
5. Deploy

**Railway:**
1. Create account at [railway.app](https://railway.app)
2. Connect GitHub repository
3. Add environment variables
4. Deploy

### Database Deployment (MongoDB Atlas)

1. Create MongoDB Atlas account
2. Create free cluster
3. Setup network access (allow all IPs for production: `0.0.0.0/0`)
4. Get connection string
5. Add to backend `.env`

---

## 📊 Features Summary

### Student Features
- ✅ User registration and login
- ✅ Submit complaints with documents
- ✅ Real-time complaint tracking
- ✅ View complaint history
- ✅ Receive status notifications
- ✅ AI-assisted category selection
- ✅ Interactive AI assistant
- ✅ User profile management
- ✅ Dark/Light theme
- ✅ Responsive mobile interface

### Admin Features
- ✅ Comprehensive dashboard
- ✅ Search and filter complaints
- ✅ Assign departments
- ✅ Update complaint status
- ✅ Add remarks and notes
- ✅ Priority management
- ✅ Complaint resolution workflow
- ✅ Analytics and reporting
- ✅ Department management
- ✅ User management
- ✅ System-wide notifications

### AI Features
- ✅ Automatic complaint categorization
- ✅ Priority level detection
- ✅ Complaint summarization
- ✅ Smart department recommendation
- ✅ Interactive AI assistant
- ✅ Graceful failure handling

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :5000
kill -9 <PID>
```

### MongoDB Connection Failed
- Check internet connection
- Verify `MONGO_URI` in `.env`
- Check MongoDB Atlas IP whitelist
- Ensure cluster is running

### Groq API Errors
- Verify API key is valid
- Check Groq API status
- Ensure rate limits not exceeded
- Verify proper error handling in code

### CORS Issues
- Verify `CLIENT_URL` matches frontend URL
- Check CORS configuration in `app.js`
- Ensure backend is running

### Build Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

---

## 📈 Performance Optimization

### Frontend
- Code splitting with React lazy loading
- Image optimization
- CSS minification with Tailwind
- JavaScript bundling with Vite
- Caching strategies

### Backend
- Database indexing on frequently searched fields
- Server-side pagination
- Response compression with Gzip
- API rate limiting
- Query optimization

---

## 🔄 API Response Format

### Success Response
```json
{
  "success": true,
  "data": {
    "id": "...",
    "name": "...",
    "..."
  },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": {
    "field": "Error message"
  }
}
```

---

## 📋 Complaint Workflow States

```
┌─────────────┐
│  Submitted  │  ← Initial state when complaint created
└──────┬──────┘
       │
       ▼
┌──────────────┐
│ Under Review │  ← Admin reviewing complaint
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Assigned   │  ← Assigned to department
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  In Progress │  ← Department working on resolution
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Resolved    │  ← Issue resolved
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Closed     │  ← Case closed
└──────────────┘
```

---

## 🎨 UI/UX Features

- **Modern Design**: Premium SaaS-like interface
- **Dark Mode**: Automatic theme switching
- **Responsive**: Mobile-first, works on all devices
- **Animations**: Smooth transitions and interactions
- **Accessibility**: Keyboard navigation, ARIA labels
- **Loading States**: Skeleton screens, spinners
- **Error Handling**: User-friendly error messages
- **Form Validation**: Real-time feedback
- **Toast Notifications**: Quick feedback for actions
- **Empty States**: Helpful prompts when no data

---

## 📱 Responsive Design Breakpoints

- **Mobile**: 320px - 640px
- **Tablet**: 641px - 1024px
- **Desktop**: 1025px+
- **Large Screens**: 1280px+

---

## 🤝 Contributing

1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit changes (`git commit -m 'Add amazing feature'`)
3. Push to branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👥 Team & Support

**Project Type**: Academic Project (MERN Stack)
**Year**: 2024
**Status**: Production Ready

For support or questions:
- Email: support@grievdesk.com
- GitHub Issues: [Create an issue](https://github.com/yourusername/smart-complaint-resolution/issues)

---

## 📚 Additional Resources

- [React Documentation](https://react.dev)
- [Express.js Guide](https://expressjs.com)
- [MongoDB Documentation](https://docs.mongodb.com)
- [Tailwind CSS](https://tailwindcss.com)
- [Vite Documentation](https://vitejs.dev)
- [Groq API Docs](https://console.groq.com/docs)

---

## ✅ Production Readiness Checklist

- [x] Authentication & Authorization
- [x] Database Models & Schemas
- [x] API Endpoints
- [x] Frontend Components
- [x] Error Handling
- [x] Security (CORS, Headers, Rate Limiting)
- [x] AI Integration
- [x] Notifications
- [x] Dark Mode
- [x] Responsive Design
- [x] Form Validation
- [x] Loading States
- [x] Documentation
- [x] Deployment Guide

---

**Built with ❤️ using MERN Stack**
#   g r i e v d e s k  
 