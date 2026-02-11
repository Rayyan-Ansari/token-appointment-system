# 🏥 Token-Based Doctor Appointment System

A modern, real-time appointment booking system using **token numbers** instead of time slots. Built with **React**, **Node.js**, **PostgreSQL**, and **Socket.IO** for live updates.

## 🌟 Features

### 👤 **Patient Features**
- ✅ Register and login with JWT authentication
- ✅ Browse approved doctors with filters (name, specialization, experience)
- ✅ Book tokens for today's session (no time slots)
- ✅ Real-time token status updates
- ✅ View queue position and estimated wait
- ✅ Mobile-first responsive design
- ✅ Dark/Light mode support

### 👩‍⚕️ **Doctor Features**
- ✅ Register with license document upload
- ✅ Dashboard with session controls (Start/Pause/Resume/End)
- ✅ Call next token with automatic progression
- ✅ Real-time patient queue view
- ✅ Analytics dashboard (today/week/month stats)
- ✅ Admin approval required before activation

### 🛡️ **Admin Features**
- ✅ Doctor verification and approval system
- ✅ View uploaded license documents
- ✅ System-wide metrics and analytics
- ✅ User management capabilities

### 🔄 **Real-Time Features**
- ✅ Live token updates via Socket.IO
- ✅ Instant session status changes
- ✅ Real-time queue position updates
- ✅ Automatic reconnection handling

## 🛠️ Tech Stack

### Frontend
- **React 18** + **TypeScript**
- **Vite** for fast development
- **Tailwind CSS** for styling
- **Radix UI** components (shadcn/ui)
- **Framer Motion** for animations
- **React Query** for server state
- **Zustand** for client state
- **React Router** for navigation
- **Socket.IO Client** for real-time updates

### Backend
- **Node.js** + **Express.js** + **TypeScript**
- **PostgreSQL** database
- **Prisma ORM** with migrations
- **Socket.IO** for real-time communication
- **JWT** authentication with bcrypt
- **Multer** for file uploads
- **Zod** for validation
- **Helmet** & **CORS** for security

## 🚀 Quick Start

### Prerequisites

1. **Node.js** 18+ ([Download](https://nodejs.org/))
2. **PostgreSQL** 14+ ([Download](https://www.postgresql.org/))
3. **npm** or **pnpm** (comes with Node.js)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd "Tokken appointment System"
```

### 2. Setup Database

1. Create a PostgreSQL database:
```sql
CREATE DATABASE token_appointment_db;
CREATE USER your_username WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE token_appointment_db TO your_username;
```

2. Update the database URL in backend/.env

### 3. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env file with your database credentials
# DATABASE_URL="postgresql://your_username:your_password@localhost:5432/token_appointment_db?schema=public"
# JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed the database with sample data
npx prisma db:seed

# Start the backend server
npm run dev
```

The backend will start at `http://localhost:5000`

### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the frontend server
npm run dev
```

The frontend will start at `http://localhost:3000`

## 🔑 Default Login Credentials

After running the seed command, you can use these accounts:

### Admin
- **Email**: `admin@tokenappointment.com`
- **Password**: `admin123!@#`

### Doctors (Approved)
- **Email**: `dr.wilson@example.com`
- **Password**: `doctor123`
- **Email**: `dr.patel@example.com`
- **Password**: `doctor123`

### Patients
- **Email**: `john.doe@example.com`
- **Password**: `patient123`
- **Email**: `jane.smith@example.com`
- **Password**: `patient123`

## 📚 API Documentation

### Authentication Endpoints

#### POST `/api/auth/patient/register`
Register a new patient
```json
{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "John Doe",
  "phone": "+1234567890",
  "dob": "1990-01-01",
  "sex": "M",
  "address": "123 Main St"
}
```

#### POST `/api/auth/doctor/register`
Register a new doctor (multipart/form-data)
```
Content-Type: multipart/form-data

email: doctor@example.com
password: password123
fullName: Dr. Jane Smith
phone: +1234567890
dob: 1980-01-01
sex: F
qualification: MBBS, MD
specialization: Internal Medicine
yearsExperience: 10
licenseNumber: MED-12345
licenseDocument: [file]
```

#### POST `/api/auth/patient/login`
Patient login
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Patient Endpoints

#### GET `/api/doctors`
Get list of approved doctors
Query params:
- `name` (optional): Filter by doctor name
- `specialization` (optional): Filter by specialization
- `minExp` (optional): Minimum years of experience
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 10)

#### GET `/api/doctors/:id/session`
Get doctor's current session status

#### POST `/api/tokens/book`
Book a token for today
```json
{
  "doctorId": "123"
}
```

#### GET `/api/tokens/my`
Get patient's tokens
Query params:
- `doctorId` (optional): Filter by doctor
- `status` (optional): Filter by status

### Doctor Endpoints

#### POST `/api/doctor/session/start`
Start today's session

#### POST `/api/doctor/session/pause`
Pause current session

#### POST `/api/doctor/session/resume`
Resume paused session

#### POST `/api/doctor/session/next`
Call next token

#### POST `/api/doctor/session/end`
End today's session

#### GET `/api/doctor/session/analytics`
Get session analytics
Query params:
- `range`: `today` | `week` | `month`

### Admin Endpoints

#### GET `/api/admin/doctors`
Get doctors for approval
Query params:
- `status` (optional): `PENDING` | `APPROVED` | `REJECTED`

#### POST `/api/admin/doctors/:id/approve`
Approve a doctor
```json
{
  "note": "Verified credentials"
}
```

#### POST `/api/admin/doctors/:id/reject`
Reject a doctor
```json
{
  "note": "Invalid license"
}
```

## 🔄 Socket.IO Events

### Client → Server
- `authenticate`: Authenticate socket with JWT token
- `join-doctor-room`: Join doctor's room for live updates
- `leave-doctor-room`: Leave doctor's room

### Server → Client

#### Session Events (to doctor room)
- `session:started`: Session started
- `session:paused`: Session paused
- `session:resumed`: Session resumed
- `session:ended`: Session ended

#### Token Events (to doctor room)
- `token:booked`: New token booked
- `token:next`: Next token called

#### Personal Events (to specific user)
- `mytoken:created`: User's token created
- `mytoken:updated`: User's token status changed

## 📱 Mobile-First Design

The application is built with a mobile-first approach:
- ✅ Responsive design for all screen sizes
- ✅ Touch-friendly interface
- ✅ Large, readable token numbers
- ✅ Sticky controls on mobile
- ✅ Optimized for portrait and landscape

## 🔒 Security Features

- ✅ JWT authentication with role-based access
- ✅ Password hashing with bcrypt (12 rounds)
- ✅ Request rate limiting
- ✅ CORS protection
- ✅ Input validation with Zod
- ✅ SQL injection prevention (Prisma ORM)
- ✅ File upload validation

## 🧪 Database Schema

### Key Tables
- `users` - Patient accounts
- `doctors` - Doctor accounts
- `admins` - Admin accounts
- `sessions` - Daily doctor sessions
- `tokens` - Individual appointment tokens
- `doctor_approvals` - Doctor verification records
- `token_logs` - Audit trail

### Key Constraints
- One session per doctor per day
- One active token per patient per session
- Sequential token numbering
- Unique license numbers

## 🚀 Deployment

### Backend Deployment
1. Set production environment variables
2. Run `npm run build`
3. Deploy to your preferred platform (AWS, Heroku, etc.)
4. Run migrations: `npx prisma migrate deploy`

### Frontend Deployment
1. Update API URLs in environment
2. Run `npm run build`
3. Deploy dist folder to CDN or static hosting

### Environment Variables

#### Backend (.env)
```
DATABASE_URL="postgresql://username:password@localhost:5432/token_appointment_db"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
PORT=5000
NODE_ENV="production"
FRONTEND_URL="https://your-frontend-domain.com"
UPLOAD_DIR="uploads"
MAX_FILE_SIZE=5242880
```

#### Frontend (.env)
```
VITE_API_URL="https://your-backend-domain.com"
VITE_SOCKET_URL="https://your-backend-domain.com"
```

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check PostgreSQL is running
   - Verify DATABASE_URL is correct
   - Ensure database exists

2. **Socket.IO Not Connecting**
   - Check CORS settings
   - Verify frontend and backend URLs
   - Check firewall settings

3. **File Upload Issues**
   - Check upload directory permissions
   - Verify MAX_FILE_SIZE setting
   - Ensure correct MIME types

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the troubleshooting section
2. Search existing issues on GitHub
3. Create a new issue with detailed information
4. Include error logs and steps to reproduce

---

**Built with ❤️ for modern healthcare systems**