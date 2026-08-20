# 🚀 GradeHub Server

GradeHub Server is the RESTful backend API for **GradeHub**, an academic and result management platform.

The server provides authentication, academic structure management, student management, course registration, result processing, transcript data, dashboards, notifications, profiles, and administrative workflows through an Express.js API backed by PostgreSQL.

## 🔗 Related Repository

- Frontend: `https://github.com/mtech10/gradehub`

## ✨ Core Responsibilities

The GradeHub Server provides APIs for:

- Authentication and authorization
- Academic departments
- Faculties
- Academic sessions
- Semesters
- Levels
- Courses
- Students
- Course registrations
- Student results
- Academic transcripts
- Dashboard data
- Student/admin profiles
- Notifications
- Promotion rules
- Application options
- Health checks

## 🧭 API Structure

All application endpoints are mounted under:

```text
/api
```

### Base Routes

```text
GET /api/
GET /api/health
```

### Authentication

```text
/api/auth
```

### Academic Structure

```text
/api/departments
/api/faculties
/api/sessions
/api/semesters
/api/levels
```

### Academic Records

```text
/api/courses
/api/students
/api/course-registrations
/api/results
/api/transcripts
```

### Application Features

```text
/api/dashboard
/api/profile
/api/notifications
/api/promotion-rules
```

The server also exposes application option endpoints through the root API router.

## 🛠️ Tech Stack

- **Node.js**
- **Express 5**
- **PostgreSQL**
- **node-postgres (`pg`)**
- **JWT (`jsonwebtoken`)**
- **bcrypt**
- **CORS**
- **cookie-parser**
- **dotenv**
- **express-validator**
- **Joi**
- **Multer**
- **csv-parse**
- **xlsx**

The exact versions are maintained in `package.json`.

## 🗄️ Database

The application uses PostgreSQL through the `pg` package.

The server creates a PostgreSQL connection pool using:

```js
process.env.DATABASE_URL;
```

The application verifies database connectivity before starting the HTTP server.

On successful startup, the server logs:

```text
PostgreSQL Connected
```

## 🔐 Authentication & Authorization

The API uses JWT-based authentication.

The middleware architecture separates:

- Authentication
- Authorization
- Validation
- UUID validation
- File upload handling
- Error handling
- Not-found handling

The API supports role-based access for application areas used by students and administrators.

Authentication also uses cookies where required by the server configuration.

## 📥 Data Upload & Processing

The server supports file-based academic data processing.

### Result Upload

Result upload functionality uses:

- Multer for receiving uploaded files
- CSV parsing for structured result files
- Validation middleware
- Result controller logic for processing academic records

### Spreadsheet Processing

The server also includes `xlsx` for spreadsheet-related processing.

The frontend provides downloadable CSV templates for:

- Students
- Courses
- Results

## 🧱 Project Structure

```text
gradehub-server/
│
├── server.js
├── package.json
├── package-lock.json
│
└── src/
    ├── app.js
    │
    ├── config/
    │   └── database.js
    │
    ├── controllers/
    │   ├── authController.js
    │   ├── courseController.js
    │   ├── courseRegistrationController.js
    │   ├── dashboardController.js
    │   ├── departmentController.js
    │   ├── facultyController.js
    │   ├── healthController.js
    │   ├── levelController.js
    │   ├── notificationController.js
    │   ├── optionsController.js
    │   ├── profileController.js
    │   ├── promotionRuleController.js
    │   ├── registrationRuleController.js
    │   ├── resultController.js
    │   ├── semesterController.js
    │   ├── sessionController.js
    │   ├── studentController.js
    │   └── transcriptController.js
    │
    ├── middleware/
    │   ├── authenticate.js
    │   ├── authorize.js
    │   ├── errorHandler.js
    │   ├── notFound.js
    │   ├── uploadResultFile.js
    │   ├── validate.js
    │   └── validateUUID.js
    │
    └── routes/
        ├── index.js
        ├── authRoutes.js
        ├── courseRoutes.js
        ├── courseRegistrationRoutes.js
        ├── dashboardRoutes.js
        ├── departmentRoutes.js
        ├── facultyRoutes.js
        ├── levelRoutes.js
        ├── notificationRoutes.js
        ├── optionsRoutes.js
        ├── profileRoutes.js
        ├── promotionRuleRoutes.js
        ├── resultRoutes.js
        ├── semesterRoutes.js
        ├── sessionRoutes.js
        ├── studentRoutes.js
        └── transcriptRoutes.js
```

## ⚙️ Getting Started

### Prerequisites

- Node.js
- npm
- PostgreSQL
- A PostgreSQL connection string

### Install

Clone the repository:

```bash
git clone https://github.com/mtech10/gradehub-server.git
cd gradehub-server
```

Install dependencies:

```bash
npm install
```

## 🔑 Environment Variables

Create a `.env` file in the project root.

At minimum, the database configuration uses:

```env
DATABASE_URL=your_postgresql_connection_string
PORT=5000
```

Authentication and other application configuration should be supplied using the environment variables expected by the relevant server modules.

> Never commit `.env` files, database credentials, JWT secrets, or other sensitive configuration to source control.

## ▶️ Running the Server

### Development

```bash
npm run dev
```

The development script uses Nodemon:

```text
nodemon server.js
```

### Production

```bash
npm start
```

The production script runs:

```text
node server.js
```

The default server port is:

```text
5000
```

## 🌐 CORS

The Express application configures CORS for the frontend applications that are allowed to communicate with the API.

The current configuration includes:

```text
http://localhost:5173
https://gradehub-hym1.onrender.com
```

Credentials are enabled in the CORS configuration.

If the frontend deployment URL changes, the allowed-origin configuration must be updated accordingly.

## 🚀 Deployment

The backend is deployed separately from the React frontend.

Production API:

```text
https://gradehub-server.onrender.com
```

The frontend is deployed at:

```text
https://gradehub-hym1.onrender.com
```

The backend must be configured to allow the deployed frontend origin through CORS.

## 🩺 Health Check

The API provides a health-check endpoint:

```text
GET /api/health
```

This can be used to verify that the server is running and responding.

## 🛡️ Error Handling

The server includes centralized error-handling middleware and a not-found middleware.

Requests flow through:

1. CORS configuration
2. JSON/urlencoded body parsing
3. Cookie parsing
4. API routes
5. Not-found handling
6. Centralized error handling

## 🔒 Security Considerations

- Use environment variables for secrets and database credentials.
- Do not expose database credentials to the frontend.
- Keep JWT secrets private.
- Use authenticated routes for protected resources.
- Use authorization middleware for role-restricted resources.
- Restrict CORS origins to trusted frontend applications.
- Validate incoming request data before processing it.
- Validate uploaded academic files before persisting their contents.

## 🔄 Frontend Integration

GradeHub Server is consumed by the GradeHub Client.

Frontend repository:

`https://github.com/mtech10/gradehub`

Production client:

```text
https://gradehub-hym1.onrender.com
```

Production API:

```text
https://gradehub-server.onrender.com
```

## 📌 Development Status

The server currently contains API modules covering the major academic-management workflows used by the GradeHub client.

Development continues around academic workflows, validation, result processing, administrative operations, and production hardening.

## 🤝 Contributing

1. Fork the repository.
2. Create a feature branch:

```bash
git checkout -b feature/your-feature
```

3. Make your changes.
4. Run the application locally.
5. Commit your changes:

```bash
git commit -m "Add your feature"
```

6. Push the branch:

```bash
git push origin feature/your-feature
```

7. Open a Pull Request.

## 📄 License

This project is currently intended for educational and development purposes.
