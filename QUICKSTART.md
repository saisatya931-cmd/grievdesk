# Quick Setup Guide

## For Windows Users (PowerShell)

### 1. Clone and navigate
```powershell
cd Desktop
git clone <repository-url>
cd smart-complaint-resolution
```

### 2. Backend Setup (PowerShell Terminal 1)
```powershell
cd server
npm install

# Create .env file
Copy-Item .env.example -Path .env

# Edit .env with your MongoDB URI and Groq API Key
# Open with: code .env

npm run dev
# Backend starts at http://localhost:5000
```

### 3. Frontend Setup (PowerShell Terminal 2)
```powershell
cd client
npm install

# Create .env file
Copy-Item .env.example -Path .env

# Edit .env if needed (defaults work for local development)
npm run dev
# Frontend starts at http://localhost:5173
```

### 4. Create Admin User (PowerShell Terminal 3)
```powershell
cd server
npm run seed:admin
# Creates admin@grievdesk.com / Admin@123456
```

---

## For Mac/Linux Users (Bash)

### 1. Clone and navigate
```bash
cd Desktop
git clone <repository-url>
cd smart-complaint-resolution
```

### 2. Backend Setup (Terminal 1)
```bash
cd server
npm install
cp .env.example .env

# Edit .env
nano .env  # or use your preferred editor

npm run dev
# Backend starts at http://localhost:5000
```

### 3. Frontend Setup (Terminal 2)
```bash
cd client
npm install
cp .env.example .env

npm run dev
# Frontend starts at http://localhost:5173
```

### 4. Create Admin User (Terminal 3)
```bash
cd server
npm run seed:admin
```

---

## Environment Variables Needed

### MongoDB
1. Visit https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create cluster
4. Get connection string
5. Add to `server/.env` as `MONGO_URI`

Example:
```
MONGO_URI=mongodb+srv://username:password@cluster0.abcde.mongodb.net/smart-complaint-resolution?retryWrites=true&w=majority
```

### Groq API
1. Visit https://console.groq.com
2. Sign up
3. Create API key
4. Add to `server/.env` as `GROQ_API_KEY`

Example:
```
GROQ_API_KEY=gsk_your_api_key_here
```

---

## Test the Application

1. Open browser: http://localhost:5173
2. Try register or login with:
   - Student: student@example.com / password123
   - Admin: admin@grievdesk.com / Admin@123456

---

## Troubleshooting

### "Port 5000 already in use"
```powershell
# Windows
Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process

# Mac/Linux
lsof -i :5000 | grep LISTEN | awk '{print $2}' | xargs kill -9
```

### "Cannot find module"
```bash
npm install
# or
rm -rf node_modules package-lock.json && npm install
```

### "MongoDB connection failed"
- Check internet connection
- Verify MongoDB URI in .env
- Check IP whitelist in MongoDB Atlas (should be 0.0.0.0/0 for development)
- Ensure cluster is active

### "Groq API not working"
- Verify API key is correct
- Check if API key has been used recently
- Check Groq console for quota usage
- Backend continues to work even if AI fails

---

## Key Folders to Know

```
server/
├── controllers/      # Business logic
├── models/          # Database schemas
├── routes/          # API endpoints
├── services/        # Reusable functions
├── middleware/      # Auth, error handling
└── uploads/         # Uploaded files

client/
├── components/      # Reusable UI components
├── pages/          # Page components
├── context/        # State management (Auth, Theme)
├── hooks/          # Custom React hooks
└── services/       # API calls
```

---

## Most Important Files

**Backend Entry**: `server/server.js`
**Backend API Setup**: `server/app.js`
**Frontend Entry**: `client/src/main.jsx`
**Frontend App**: `client/src/App.jsx`

---

## Useful Commands

```bash
# Backend
npm run dev          # Development with nodemon
npm start            # Production
npm run seed:admin   # Create admin user

# Frontend
npm run dev          # Development server
npm run build        # Production build
npm run preview      # Preview build
```

---

## Next Steps

1. ✅ Install all dependencies
2. ✅ Configure .env files
3. ✅ Start backend server
4. ✅ Start frontend server
5. ✅ Create admin account
6. ✅ Test registration and login
7. ✅ Submit a test complaint
8. ✅ View admin dashboard

See README.md for complete documentation!
