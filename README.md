# Task App with Firebase Authentication

A simple MERN stack todo application with Firebase authentication and role-based authorization.

## Features

- **Authentication**: Firebase Authentication for user login/signup
- **Role-based Authorization**: Users have either 'user' or 'admin' roles
- **CRUD Operations**: Create, Read, Update, Delete tasks
- **Role-based Access Control**:
  - Users can only see and manage their own tasks
  - Admins can see and manage all tasks
  - Only admins can delete any task

## Project Structure

```
├── backend/                 # Express.js backend
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── middleware/         # Authentication middleware
│   └── server.js           # Main server file
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── contexts/       # React contexts
│   │   └── services/       # API services
└── package.json           # Root package.json for scripts
```

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Firebase project

### 1. Clone and Install Dependencies

```bash
npm run install-all
```

### 2. Firebase Setup

1. Create a Firebase project at https://console.firebase.google.com/
2. Enable Authentication and Email/Password sign-in method
3. Generate a service account key:
   - Go to Project Settings > Service Accounts
   - Generate new private key
   - Download the JSON file

### 3. Environment Variables

#### Backend (.env)
```bash
cd backend
cp env.example .env
```

Edit `.env` with your values:
```
MONGODB_URI=mongodb://localhost:27017/todo-app
PORT=5000
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour-firebase-private-key\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-firebase-client-email@your-project.iam.gserviceaccount.com
```

#### Frontend (.env)
```bash
cd frontend
cp env.example .env
```

Edit `.env` with your Firebase config:
```
REACT_APP_FIREBASE_API_KEY=your-firebase-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-firebase-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
REACT_APP_FIREBASE_APP_ID=your-firebase-app-id
REACT_APP_API_BASE_URL=http://localhost:5000/api
```

### 4. Start the Application

```bash
# Start  backend
npm run dev

# Start fronted
 npm start

# Or start them separately:
npm run server  # Backend only
npm run client  # Frontend only
```

## API Endpoints

### Tasks
- `GET /api/tasks` - Get all tasks (users see only their tasks, admins see all)
- `POST /api/tasks` - Create a new task
- `PUT /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task

### Users
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/:id/role` - Update user role (admin only)

## Role-based Access Control

### User Role
- Can create, read, update, and delete their own tasks
- Cannot see other users' tasks
- Cannot modify user roles

### Admin Role
- Can see and manage all tasks
- Can delete any task
- Can update user roles

## Default Behavior

- New users are assigned the 'user' role by default
- The first user can be manually promoted to 'admin' in the database
- Users can only perform actions on their own tasks unless they are admins

## Technologies Used

- **Backend**: Node.js, Express.js, MongoDB, Mongoose, Firebase Admin SDK
- **Frontend**: React, Firebase Authentication, Axios
- **Database**: MongoDB
- **Authentication**: Firebase Authentication
