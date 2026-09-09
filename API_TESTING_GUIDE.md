# API Testing Guide - GrievDesk

This guide provides example requests for all endpoints. Use with Postman, Insomnia, or cURL.

## 🔑 Common Headers

```
Content-Type: application/json
Authorization: Bearer <your_jwt_token>
```

---

## 📝 Authentication Endpoints

### 1. Register (POST)
```
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "studentId": "STU-2024-001"
}

Response:
{
  "success": true,
  "data": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student",
    "studentId": "STU-2024-001"
  },
  "token": "eyJhbGc..."
}
```

### 2. Login (POST)
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "data": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student"
  },
  "token": "eyJhbGc..."
}
```

### 3. Logout (POST)
```
POST http://localhost:5000/api/auth/logout
Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "Logged out successfully"
}
```

### 4. Get Current User Profile (GET)
```
GET http://localhost:5000/api/auth/me
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student",
    "studentId": "STU-2024-001",
    "department": null,
    "phone": null,
    "avatar": null,
    "isActive": true
  }
}
```

---

## 📋 Complaint Endpoints

### 1. Create Complaint (POST) - STUDENT
```
POST http://localhost:5000/api/complaints
Authorization: Bearer <student_token>
Content-Type: application/json

{
  "title": "Classroom projector not working",
  "description": "The projector in Room 101 has not been working for three days. This is affecting our class presentations.",
  "category": "Infrastructure",
  "priority": "High"
}

Response:
{
  "success": true,
  "data": {
    "_id": "...",
    "complaintId": "COMP-2024-00001",
    "student": "...",
    "studentName": "John Doe",
    "studentEmail": "john@example.com",
    "title": "Classroom projector not working",
    "description": "...",
    "category": "Infrastructure",
    "priority": "High",
    "status": "Submitted",
    "aiAnalysis": {
      "category": "Infrastructure",
      "priority": "High",
      "summary": "Classroom projector malfunction affecting presentations",
      "recommendedDepartment": "Infrastructure Department"
    },
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

### 2. Get All Complaints (ADMIN) (GET)
```
GET http://localhost:5000/api/complaints
Authorization: Bearer <admin_token>
Query Parameters:
  - page=1 (default)
  - limit=10 (default)
  - category=Infrastructure
  - status=Submitted
  - priority=High
  - search=projector

Response:
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "complaintId": "COMP-2024-00001",
      "studentName": "John Doe",
      "title": "Classroom projector not working",
      "category": "Infrastructure",
      "priority": "High",
      "status": "Submitted",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 42,
    "pages": 5,
    "currentPage": 1
  }
}
```

### 3. Get My Complaints (STUDENT) (GET)
```
GET http://localhost:5000/api/complaints/my
Authorization: Bearer <student_token>
Query Parameters:
  - page=1
  - limit=10
  - status=Submitted

Response: [Same as above]
```

### 4. Get Complaint Details (GET)
```
GET http://localhost:5000/api/complaints/COMPLAINT_ID
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "_id": "...",
    "complaintId": "COMP-2024-00001",
    "student": {
      "_id": "...",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "title": "Classroom projector not working",
    "description": "...",
    "category": "Infrastructure",
    "priority": "High",
    "department": {
      "_id": "...",
      "name": "Infrastructure Department"
    },
    "status": "Assigned",
    "statusHistory": [
      {
        "status": "Submitted",
        "timestamp": "2024-01-15T10:30:00Z"
      },
      {
        "status": "Under Review",
        "timestamp": "2024-01-15T11:00:00Z"
      }
    ],
    "adminRemarks": [
      {
        "remark": "We will check the projector today",
        "addedBy": {
          "name": "Admin User"
        },
        "addedAt": "2024-01-15T11:30:00Z"
      }
    ],
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T11:30:00Z"
  }
}
```

### 5. Update Complaint Status (ADMIN) (PUT)
```
PUT http://localhost:5000/api/complaints/COMPLAINT_ID/status
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "status": "In Progress",
  "remark": "Our team is working on fixing the projector"
}

Valid Status Transitions:
- Submitted → Under Review, Rejected
- Under Review → Assigned, Rejected
- Assigned → In Progress, Rejected
- In Progress → Resolved, Rejected
- Resolved → Closed

Response:
{
  "success": true,
  "data": { ...updated complaint... }
}
```

### 6. Add Admin Remark (ADMIN) (POST)
```
POST http://localhost:5000/api/complaints/COMPLAINT_ID/remark
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "remark": "The projector has been repaired and tested. Ready for use."
}

Response:
{
  "success": true,
  "data": { ...updated complaint... }
}
```

### 7. Assign Department (ADMIN) (PUT)
```
PUT http://localhost:5000/api/complaints/COMPLAINT_ID/assign
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "departmentId": "DEPARTMENT_ID"
}

Response:
{
  "success": true,
  "data": { ...updated complaint... }
}
```

### 8. Update Priority (ADMIN) (PUT)
```
PUT http://localhost:5000/api/complaints/COMPLAINT_ID/priority
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "priority": "Critical"
}

Valid Priorities: Low, Medium, High, Critical

Response:
{
  "success": true,
  "data": { ...updated complaint... }
}
```

### 9. Resolve Complaint (ADMIN) (PUT)
```
PUT http://localhost:5000/api/complaints/COMPLAINT_ID/resolve
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "resolutionText": "The classroom projector has been successfully repaired and is now functioning normally."
}

Response:
{
  "success": true,
  "data": { ...resolved complaint... }
}
```

---

## 🏢 Department Endpoints

### 1. Get All Departments (GET)
```
GET http://localhost:5000/api/departments
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "name": "Infrastructure Department",
      "description": "Handles infrastructure-related complaints",
      "head": "Dr. Smith",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### 2. Create Department (ADMIN) (POST)
```
POST http://localhost:5000/api/departments
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "IT Support",
  "description": "Handles IT and technical issues",
  "head": "John Tech"
}

Response:
{
  "success": true,
  "data": { ...created department... }
}
```

### 3. Update Department (ADMIN) (PUT)
```
PUT http://localhost:5000/api/departments/DEPARTMENT_ID
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "IT Support Department",
  "head": "Jane Tech",
  "isActive": true
}

Response:
{
  "success": true,
  "data": { ...updated department... }
}
```

### 4. Delete Department (ADMIN) (DELETE)
```
DELETE http://localhost:5000/api/departments/DEPARTMENT_ID
Authorization: Bearer <admin_token>

Response:
{
  "success": true,
  "message": "Department deleted successfully"
}
```

---

## 👥 User Endpoints

### 1. Get User Profile (GET)
```
GET http://localhost:5000/api/users/profile
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student",
    "studentId": "STU-2024-001",
    "department": null,
    "phone": "+1-234-567-8900",
    "avatar": null,
    "isActive": true
  }
}
```

### 2. Update User Profile (PUT)
```
PUT http://localhost:5000/api/users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Doe Updated",
  "phone": "+1-234-567-8900",
  "avatar": "https://..."
}

Response:
{
  "success": true,
  "data": { ...updated profile... }
}
```

### 3. Get All Users (ADMIN) (GET)
```
GET http://localhost:5000/api/users
Authorization: Bearer <admin_token>
Query Parameters:
  - page=1
  - limit=10
  - role=student  (filter by role)

Response:
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "student",
      "isActive": true
    }
  ],
  "pagination": {
    "total": 150,
    "pages": 15,
    "currentPage": 1
  }
}
```

### 4. Update User Status (ADMIN) (PUT)
```
PUT http://localhost:5000/api/users/USER_ID/status
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "isActive": false
}

Response:
{
  "success": true,
  "data": { ...updated user... }
}
```

---

## 🔔 Notification Endpoints

### 1. Get Notifications (GET)
```
GET http://localhost:5000/api/notifications
Authorization: Bearer <token>
Query Parameters:
  - page=1
  - limit=10

Response:
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "title": "Complaint Submitted",
      "message": "Your complaint has been submitted successfully",
      "type": "success",
      "isRead": false,
      "relatedComplaint": "COMP-2024-00001",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 25,
    "pages": 3,
    "currentPage": 1
  }
}
```

### 2. Mark as Read (PUT)
```
PUT http://localhost:5000/api/notifications/NOTIFICATION_ID/read
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": { ...updated notification... }
}
```

### 3. Mark All as Read (PUT)
```
PUT http://localhost:5000/api/notifications/read-all
Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "All notifications marked as read"
}
```

---

## 🤖 AI Endpoints

### 1. Analyze Complaint (POST)
```
POST http://localhost:5000/api/ai/analyze
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Library books not available",
  "description": "I went to the library to find books for my research but most of the books in my subject area are out of stock or damaged."
}

Response:
{
  "success": true,
  "data": {
    "category": "Library",
    "priority": "Medium",
    "summary": "Library books unavailable for research",
    "recommendedDepartment": "Library Administration"
  }
}
```

### 2. AI Assistant Chat (POST)
```
POST http://localhost:5000/api/ai/chat
Authorization: Bearer <token>
Content-Type: application/json

{
  "question": "How do I submit a complaint?"
}

Response:
{
  "success": true,
  "data": {
    "question": "How do I submit a complaint?",
    "answer": "To submit a complaint, follow these steps:\n1. Login to your student account\n2. Navigate to 'My Complaints'\n3. Click 'New Complaint'\n4. Fill in the details...\n"
  }
}
```

---

## 📊 Dashboard Endpoints

### 1. Student Dashboard (GET)
```
GET http://localhost:5000/api/dashboard/student
Authorization: Bearer <student_token>

Response:
{
  "success": true,
  "data": {
    "statistics": {
      "totalComplaints": 5,
      "submitted": 1,
      "underReview": 1,
      "inProgress": 2,
      "resolved": 1,
      "closed": 0
    },
    "recentComplaints": [
      {
        "complaintId": "COMP-2024-00005",
        "title": "Lab equipment issue",
        "category": "Laboratory",
        "status": "In Progress",
        "createdAt": "2024-01-20T15:00:00Z"
      }
    ]
  }
}
```

### 2. Admin Dashboard (GET)
```
GET http://localhost:5000/api/dashboard/admin
Authorization: Bearer <admin_token>

Response:
{
  "success": true,
  "data": {
    "statistics": {
      "totalComplaints": 150,
      "submitted": 15,
      "underReview": 20,
      "assigned": 35,
      "inProgress": 45,
      "resolved": 30,
      "closed": 5,
      "critical": 3,
      "high": 28,
      "medium": 89,
      "low": 30,
      "totalStudents": 500,
      "totalAdmins": 12
    },
    "complaintsByCategory": [
      { "_id": "Infrastructure", "count": 45 },
      { "_id": "Academic", "count": 38 }
    ],
    "complaintsByStatus": [
      { "_id": "In Progress", "count": 45 }
    ],
    "recentComplaints": [...]
  }
}
```

### 3. Analytics (GET)
```
GET http://localhost:5000/api/dashboard/analytics
Authorization: Bearer <admin_token>
Query Parameters:
  - startDate=2024-01-01
  - endDate=2024-01-31

Response:
{
  "success": true,
  "data": {
    "monthlyTrends": [
      { "_id": { "year": 2024, "month": 1 }, "count": 42 }
    ],
    "resolutionRate": "76.50",
    "avgResolutionTime": "2.35",
    "totalComplaints": 150,
    "resolvedComplaints": 115
  }
}
```

---

## 🧪 Test Sequence

### 1. Register & Login
- POST /auth/register
- POST /auth/login
- GET /auth/me

### 2. Create & Manage Complaints (Student)
- POST /complaints (create)
- GET /complaints/my (view own)
- GET /complaints/:id (view details)

### 3. Admin Operations
- GET /complaints (all complaints)
- PUT /complaints/:id/status (update status)
- POST /complaints/:id/remark (add remark)
- PUT /complaints/:id/assign (assign dept)
- PUT /complaints/:id/priority (change priority)

### 4. AI Features
- POST /ai/analyze (analyze complaint)
- POST /ai/chat (ask questions)

### 5. Dashboard & Analytics
- GET /dashboard/student (student stats)
- GET /dashboard/admin (admin stats)
- GET /dashboard/analytics (analytics)

### 6. Other Operations
- PUT /users/profile (update profile)
- GET /departments (list departments)
- GET /notifications (check notifications)

---

## 📝 Error Response Examples

### Unauthorized
```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

### Validation Error
```json
{
  "success": false,
  "message": "Title, description, and category are required"
}
```

### Not Found
```json
{
  "success": false,
  "message": "Complaint not found"
}
```

### Server Error
```json
{
  "success": false,
  "message": "Server Error"
}
```

---

## 💡 Tips

1. Save your token in Postman environment variables
2. Use Postman Collections for organized testing
3. Test all status transitions according to workflow
4. Verify AI features work with real Groq API key
5. Test pagination with different page and limit values
6. Test filters independently and in combination
7. Verify authorization for each role

Happy Testing! 🚀
