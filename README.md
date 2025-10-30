# SkillForge AdminPanel

A comprehensive admin panel for SkillForge - a Teachable-like platform where users can create schools, manage courses, and handle student enrollments.

## 🎯 **Project Overview**

SkillForge AdminPanel is designed for **Teachers, Managers, and Administrators** to manage their educational institutions. The system implements sophisticated role-based access control and multi-school support.

## 🔐 **Authentication & Access Control**

### **User Roles & Permissions**

| Role               | Admin Panel Access | School Management | Course Management | Student Management |
| ------------------ | ------------------ | ----------------- | ----------------- | ------------------ |
| **ADMIN**          | ✅ Full Access     | ✅ Full Access    | ✅ Full Access    | ✅ Full Access     |
| **MANAGER**        | ✅ Full Access     | ✅ Full Access    | ✅ Full Access    | ✅ Full Access     |
| **TEACHER**        | ✅ Limited Access  | ✅ Own Courses    | ✅ Own Courses    | ✅ Own Students    |
| **USER (Student)** | ❌ No Access       | ❌ No Access      | ❌ No Access      | ❌ No Access       |

### **Authentication Flow**

#### **1. Login Process**

- Users can login with **email OR phone** + password
- System checks user role and redirects accordingly:
  - **Students (USER role)**: Redirected to their school's dashboard
  - **Teachers/Managers/Admins**: Access admin panel

#### **2. Multi-School Support**

- Users can be enrolled in multiple schools with different roles
- If user has multiple schools:
  - **Students**: School selection page → Redirect to chosen school
  - **Teachers**: Access admin panel with school switching

#### **3. School-Specific Access**

- Each school has a unique domain/subdomain
- Students access: `schoolname.skillforge.com`
- Teachers access: `admin.skillforge.com` (this panel)

### **Route Protection**

#### **Public Routes** (No Authentication Required)

- `/login` - Authentication page
- `/register` - Teacher registration
- `/find-school` - School discovery for students
- `/select-school` - School selection for multi-school users
- `/unauthorized` - Access denied page
- `/support`, `/terms`, `/privacy` - Static pages

#### **Protected Routes** (Authentication Required)

- `/dashboard` - Main admin dashboard
- `/schools` - School management
- `/courses` - Course management
- `/students` - Student management
- `/analytics` - Analytics and reports
- `/settings` - System settings

## 🏗️ **Architecture**

### **Frontend Stack**

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Shadcn/ui
- **State Management**: Zustand
- **Authentication**: JWT with HTTP-only cookies
- **Forms**: React Hook Form + Zod validation

### **Backend Integration**

- **API**: RESTful API with NestJS
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT tokens
- **File Upload**: UploadThing integration
- **Real-time**: WebSocket support

## 🚀 **Key Features**

### **Authentication System**

- ✅ Role-based access control
- ✅ Multi-school user support
- ✅ JWT token management
- ✅ Automatic redirects based on user role
- ✅ School selection for multi-school users

### **School Management**

- ✅ Create and manage schools
- ✅ Custom domain support
- ✅ School-specific settings
- ✅ Teacher and student management

### **Course Management**

- ✅ Create, edit, and delete courses
- ✅ Lesson management
- ✅ Media upload support
- ✅ Course enrollment tracking

### **User Management**

- ✅ Student enrollment
- ✅ Teacher assignment
- ✅ Role management
- ✅ Profile management

### **Analytics & Reporting**

- ✅ Course performance metrics
- ✅ Student progress tracking
- ✅ Revenue analytics
- ✅ Enrollment statistics

## 📁 **Project Structure**

```
SkillForge-AdminPanel/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication pages
│   │   ├── login/               # Login page
│   │   ├── register/            # Teacher registration
│   │   ├── find-school/         # School discovery
│   │   └── select-school/       # School selection
│   ├── dashboard/               # Main dashboard
│   ├── schools/                 # School management
│   ├── courses/                 # Course management
│   ├── students/                # Student management
│   ├── analytics/               # Analytics & reports
│   ├── settings/                # System settings
│   └── unauthorized/            # Access denied page
├── components/                   # Reusable components
│   ├── ui/                      # Shadcn/ui components
│   ├── auth-guard.tsx           # Route protection
│   ├── layout/                  # Layout components
│   └── providers/               # Context providers
├── lib/                         # Utility libraries
│   ├── api.ts                   # API client
│   ├── auth.ts                  # Authentication service
│   ├── utils.ts                 # Utility functions
│   └── validations.ts           # Form validations
├── types/                       # TypeScript types
│   └── api.ts                   # API response types
├── middleware.ts                # Next.js middleware
└── README.md                    # Project documentation
```

## 🔧 **Setup Instructions**

### **Prerequisites**

- Node.js 18+
- npm or yarn
- PostgreSQL database
- SkillForge Backend running

### **Installation**

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd SkillForge-AdminPanel
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**

   ```bash
   cp .env.example .env.local
   ```

   Configure the following variables:

   ```env
   # Backend API
   NEXT_PUBLIC_API_URL=http://localhost:3000

   # Authentication
   JWT_SECRET=your-jwt-secret

   # Database
   DATABASE_URL=postgresql://user:password@localhost:5432/skillforge

   # File Upload
   UPLOADTHING_SECRET=your-uploadthing-secret
   UPLOADTHING_APP_ID=your-uploadthing-app-id
   ```

4. **Run the development server**

   ```bash
   npm run dev
   ```

5. **Access the application**
   - Admin Panel: `http://localhost:3000`
   - Backend API: `http://localhost:3001`

## 🔄 **Authentication Flow Examples**

### **Scenario 1: Student Login**

1. Student visits `/login`
2. Enters credentials
3. System detects USER role
4. Redirects to school dashboard: `schoolname.skillforge.com`

### **Scenario 2: Teacher Login**

1. Teacher visits `/login`
2. Enters credentials
3. System detects TEACHER role
4. Redirects to admin panel: `/dashboard`

### **Scenario 3: Multi-School Student**

1. Student visits `/login`
2. Enters credentials
3. System detects multiple schools
4. Shows school selection page
5. Student chooses school
6. Redirects to chosen school dashboard

### **Scenario 4: New Teacher Registration**

1. Teacher visits `/register`
2. Chooses "Create New School" or "Join Existing School"
3. Fills registration form
4. System creates account and school (if new)
5. Redirects to admin panel

## 🛡️ **Security Features**

- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access**: Granular permissions based on user roles
- **Route Protection**: Middleware-based route protection
- **CSRF Protection**: Built-in CSRF protection
- **Input Validation**: Comprehensive form validation
- **Secure Headers**: Security headers configuration

## 📊 **API Integration**

The frontend integrates with the SkillForge Backend API:

- **Authentication**: Login, register, logout
- **Schools**: CRUD operations for schools
- **Courses**: Course and lesson management
- **Users**: User and profile management
- **Media**: File upload and management
- **Analytics**: Performance metrics and reports

## 🎨 **UI/UX Features**

- **Responsive Design**: Mobile-first responsive design
- **Dark Mode**: Built-in dark/light theme support
- **Accessibility**: WCAG 2.1 compliant components
- **Loading States**: Comprehensive loading indicators
- **Error Handling**: User-friendly error messages
- **Toast Notifications**: Real-time feedback

## 🚀 **Deployment**

### **Production Build**

```bash
npm run build
npm start
```

### **Environment Variables**

Ensure all production environment variables are configured:

- Database connection
- API endpoints
- JWT secrets
- File upload credentials

### **Domain Configuration**

- Configure custom domains for schools
- Set up SSL certificates
- Configure DNS records

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 **License**

This project is licensed under the MIT License.

## 🆘 **Support**

For support and questions:

- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**SkillForge AdminPanel** - Empowering educators to create exceptional learning experiences.
