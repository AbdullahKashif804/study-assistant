# Study Assistant

A full-stack MERN-based study management application designed to help students organize their academic life in one place.

Study Assistant provides a centralized platform for managing notes, assignments, projects, courses, quizzes, daily tasks, and to-do tasks, with authentication, file attachments, email verification, search, filtering, notifications, dark mode, and admin management.

## Features

### Authentication & User Management

* User registration and login
* JWT-based authentication
* Email verification with a 6-digit verification code
* Resend verification code
* Secure password hashing with bcrypt
* Change password
* Profile management
* Profile image upload
* Account deletion
* User and Admin roles
* User-specific data isolation

### Study Management

* Create, view, update, and delete notes
* Create, view, update, and delete assignments
* Create, view, update, and delete projects
* Manage courses
* Manage quizzes
* Manage daily tasks
* Manage to-do tasks
* Assignment status management
* Assignment marks tracking
* Course references
* Dashboard overview

### Search & Organization

* Global search
* Module-specific search
* Filtering
* Sorting
* Pagination
* Result summaries
* Course-based organization

### File Attachments

Cloudinary-powered file management for:

* PDF
* DOCX
* PPTX
* JPG/JPEG
* PNG
* WEBP

Includes:

* File upload
* File viewing/downloading
* File replacement
* File deletion
* File type validation
* File size validation
* Cloudinary asset cleanup

### Notifications

* Assignment and task deadline reminders
* Configurable deadline notifications
* In-app notification handling

### Admin Panel

Administrators can manage and monitor application data through a dedicated admin module.

Includes:

* User management
* Academic data overview
* Application statistics
* Admin-only routes
* Role-based access control

### UI/UX

* Responsive design
* Desktop, tablet, and mobile support
* Dark mode
* Shared navigation system
* Responsive sidebar
* Consistent forms and cards
* Loading states
* Error handling
* Responsive authentication pages
* Responsive dashboard

### Legal & Settings

* Privacy Policy
* Terms & Conditions
* Account settings
* Password management
* Notification preferences
* Theme preferences

---

## Tech Stack

### Frontend

* React
* Vite
* Tailwind CSS
* React Router
* Fetch API
* Lucide React

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT
* bcrypt
* Multer
* Nodemailer
* Cloudinary
* CORS
* dotenv

### Database & Services

* MongoDB
* Cloudinary
* Gmail SMTP

---

## Project Structure

```text
study-assistant/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── uploads/
│   ├── server.js
│   └── .env
│
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── context/
│       ├── pages/
│       ├── services/
│       ├── App.jsx
│       └── main.jsx
│
├── .gitignore
├── package.json
└── README.md
```

---

## Main Modules

The application contains the following major modules:

* Home
* Dashboard
* Notes
* Assignments
* Projects
* Courses
* Quizzes
* Daily Tasks
* To-Do Tasks
* Global Search
* Profile
* Settings
* Admin Panel
* Privacy Policy
* Terms & Conditions

---

## Authentication Flow

The authentication system uses JWT tokens.

```text
Signup
   ↓
Email Verification
   ↓
User Account Created
   ↓
Login
   ↓
JWT Token
   ↓
Authenticated Application
```

Protected backend routes verify the JWT before allowing access to user data.

Admin routes additionally verify the user's role.

---

## File Upload Flow

```text
User selects file
       ↓
Frontend validation
       ↓
Multer middleware
       ↓
File type & size validation
       ↓
Cloudinary upload
       ↓
Metadata stored in MongoDB
       ↓
File available in application
```

When a file is replaced or deleted, the corresponding Cloudinary asset is also removed.

---

## Security

The application includes several security measures:

* JWT authentication
* Password hashing with bcrypt
* Protected API routes
* Role-based authorization
* User data isolation
* Environment variables for secrets
* File type restrictions
* File size restrictions
* Cloudinary asset cleanup
* Password excluded from profile queries
* Generic production error responses
* `.env` excluded from Git
* Upload directory excluded from Git
* Admin-only API access

---

## Environment Variables

Create a `.env` file inside the `backend` directory.

Example:

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

EMAIL_USER=your_email
EMAIL_PASS=your_email_password
```

Never commit your `.env` file or expose your secret credentials publicly.

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/AbdullahKashif804/study-assistant.git
```

### 2. Open the project

```bash
cd study-assistant
```

### 3. Install backend dependencies

```bash
cd backend
npm install
```

### 4. Configure backend environment variables

Create:

```text
backend/.env
```

and add the required environment variables.

### 5. Start the backend

```bash
npm run dev
```

or, depending on the project scripts:

```bash
node server.js
```

### 6. Install frontend dependencies

Open another terminal:

```bash
cd frontend
npm install
```

### 7. Start the frontend

```bash
npm run dev
```

The frontend will normally run on:

```text
http://localhost:5173
```

The backend will normally run on:

```text
http://localhost:5000
```

---

## Testing

The application has been extensively tested across:

* Authentication
* Authorization
* User data isolation
* Admin access
* CRUD operations
* Search
* Filtering
* Pagination
* File uploads
* File deletion
* Email verification
* Password management
* Settings
* Dark mode
* Responsive layouts
* Mobile layouts
* Tablet layouts
* Desktop layouts
* Console and network behavior

A total of **150 functional test cases** were completed successfully during project validation.

---

## Responsive Design

The application has been tested across:

* Desktop
* Tablet
* Mobile

The interface includes responsive:

* Navigation
* Sidebar
* Forms
* Cards
* Lists
* Search
* Pagination
* Authentication pages
* Dashboard
* Admin panel

---

## Current Status

**Project Status: Production Preparation**

Completed:

* Full-stack MERN application
* Authentication
* Email verification
* User management
* Admin panel
* Study modules
* Search and filtering
* Pagination
* Cloudinary integration
* Notifications
* Settings
* Dark mode
* Responsive UI
* Security review
* Functional testing
* UI/UX validation
* Git/GitHub setup

Next steps:

* Production database setup
* Backend deployment
* Frontend deployment
* Production environment configuration
* Production CORS configuration
* Final deployed application testing
* Documentation and screenshots

---

## Future Improvements

Possible future improvements include:

* AI-powered study recommendations
* AI-generated summaries
* AI quiz generation
* AI study planning
* Personalized learning analytics
* Calendar integration
* Advanced academic analytics
* More notification channels
* Progressive Web App support

---

## Author

**Abdullah Kashif**

BS Artificial Intelligence Student
MERN Stack Developer

GitHub:
https://github.com/AbdullahKashif804

---

## License

This project is developed for educational and portfolio purposes.
