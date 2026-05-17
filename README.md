# CampusCare – Smart Facility Management System

CampusCare is a mobile-based smart facility management system developed using React Native (Expo), Node.js, Express.js, PostgreSQL (Supabase), and Supabase Storage.

The application allows community members to report maintenance issues on campus, facility managers to assign and manage issues, and workers to update issue progress and upload completion photos.

---
# Features

## Community Member
- Register and login
- Submit maintenance issues
- Upload issue photos
- View submitted issues
- Track issue status
- View issue details

## Facility Manager
- View all submitted issues
- Filter issues by status
- Assign issues to workers
- Update issue status
- Close resolved issues

## Worker
- View assigned issues
- Mark issues as “In Progress”
- Add work comments
- Upload completion photos

---

# Technologies Used

## Frontend
- React Native with Expo
- React Navigation
- AsyncStorage

## Backend
- Node.js
- Express.js
- JWT Authentication
- bcrypt.js

## Database & Storage
- PostgreSQL (Supabase)
- Supabase Storage

---

# Project Structure

```bash
Project/
│
├── frontend/
│   ├── screens/
│   ├── services/
│   ├── App.js
│   ├── package.json
│   └── supabase.js
│
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── models/
│   ├── server.js
│   └── package.json
```

---

# Setup Instructions

## Prerequisites
- Node.js installed
- Expo Go installed on mobile device
- Supabase project configured

---

# Backend Setup

```bash
cd backend
npm install
npm start
```

Backend runs on:

```bash
http://localhost:8000
```

---

# Frontend Setup

```bash
cd frontend
npm install
npx expo start
```

Scan the QR code using Expo Go.

---

# Network Configuration

The frontend communicates with the backend using the local machine IPv4 address.
Before running the project on a physical mobile device:

1. Connect both laptop and mobile device to the same Wi-Fi or hotspot.
2. Run the following command in terminal:

```bash
ipconfig
```

3. Copy the IPv4 Address.
4. Replace the backend IP inside all frontend fetch requests.

Example:

```js
fetch("http://192.168.1.22:8000/api/issues")
```

---

# Authentication & Authorization

JWT-based authentication is implemented with role-based access control for:
- Community Member
- Facility Manager
- Worker

Passwords are securely hashed using bcrypt.

---

# Image Upload

Issue photos and completion photos are uploaded and stored using Supabase Storage.

---

# Main Functionalities

- User registration and login
- Role-based dashboards
- Issue submission and tracking
- Worker assignment system
- Issue status updates
- Completion photo uploads
- Comment system for workers

---

# Authors

- Salma Walid
