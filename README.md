# Expense Management System

A full-stack expense management application with multi-level approval workflows, role-based access control, and multi-tenant architecture.

## Features

### Core Functionality
- **Multi-tenant Architecture** - Each company has isolated data with its own users and expenses
- **Role-Based Access Control** - Three user roles: Admin, Manager, and Employee
- **Multi-Level Approval Workflows** - Configurable approval chains based on expense amounts
- **Hierarchical User Management** - Manager-subordinate relationships with approval routing
- **Currency Support** - Automatic currency detection based on company country

### User Roles

#### Admin
- Create and manage users (employees and managers)
- View all company expenses
- Configure approval flows
- Assign managers to employees
- Manage user roles and departments

#### Manager
- Review and approve/reject pending expenses
- View team expenses
- Provide comments on approval decisions
- Multi-level approval support

#### Employee
- Submit expense claims with details
- Track expense status in real-time
- View approval progress and history
- Update pending expenses

## Tech Stack

### Backend
- **Node.js** with **Express.js** - REST API framework
- **MySQL** - Relational database
- **Sequelize ORM** - Database modeling and queries
- **JWT** - Authentication and authorization
- **bcryptjs** - Password hashing
- **express-validator** - Input validation

### Frontend
- **React 18** - UI framework
- **React Router v6** - Client-side routing
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **Context API** - State management

## Project Structure

```
expense-final/
├── backend/
│   ├── config/
│   │   └── database.js           # Database configuration
│   ├── controller/
│   │   ├── auth.controller.js    # Authentication logic
│   │   ├── user.controller.js    # User management
│   │   ├── expense.controller.js # Expense CRUD operations
│   │   └── approval.controller.js # Approval workflow logic
│   ├── middleware/
│   │   ├── auth.middleware.js    # JWT verification
│   │   └── role.middleware.js    # Role-based authorization
│   ├── models/
│   │   ├── User.js               # User model with bcrypt hooks
│   │   ├── Company.js            # Company/tenant model
│   │   ├── Expense.js            # Expense model
│   │   └── ApprovalFlow.js       # Approval workflow models
│   ├── routes/
│   │   ├── auth.routes.js        # Auth endpoints
│   │   ├── user.routes.js        # User management endpoints
│   │   ├── expense.routes.js     # Expense endpoints
│   │   └── approval.routes.js    # Approval endpoints
│   ├── utils/
│   │   ├── helpers.js            # Utility functions
│   │   └── validators.js         # Request validators
│   ├── .env.example              # Environment variables template
│   ├── package.json
│   └── server.js                 # Entry point
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Auth/
    │   │   │   ├── Login.jsx
    │   │   │   └── Signup.jsx
    │   │   ├── Dashboard/
    │   │   │   ├── AdminDashboard.jsx
    │   │   │   ├── ManagerDashboard.jsx
    │   │   │   └── EmployeeDashboard.jsx
    │   │   ├── Expense/
    │   │   │   ├── ExpenseForm.jsx
    │   │   │   ├── ExpenseList.jsx
    │   │   │   └── ExpenseDetail.jsx
    │   │   ├── Approval/
    │   │   │   ├── ApprovalHistory.jsx
    │   │   │   └── PendingApprovals.jsx
    │   │   └── Layout/
    │   │       ├── Navbar.jsx
    │   │       └── Sidebar.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx   # Authentication state
    │   ├── services/
    │   │   └── api.js            # Axios configuration
    │   ├── App.jsx               # Main app component
    │   └── main.jsx              # React entry point
    ├── .env.example
    ├── package.json
    └── tailwind.config.js
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- npm or yarn

### Backend Setup

1. **Clone the repository**
```bash
git clone https://github.com/shivanisbhat/expense-final.git
cd expense-final/backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
```

Edit `.env` file:
```env
# Server
PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=expense_management
DB_USER=root
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d
```

4. **Create MySQL database**
```sql
CREATE DATABASE expense_management;
```

5. **Start the server**
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory**
```bash
cd ../frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
```

Edit `.env` file:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

4. **Start the development server**
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## API Documentation

### Authentication Endpoints

#### Signup (Create Company & Admin)
```http
POST /api/auth/signup
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@company.com",
  "password": "SecurePass123",
  "companyName": "Acme Corp",
  "country": "United States"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@company.com",
  "password": "SecurePass123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### User Management (Admin Only)

#### Create User
```http
POST /api/users
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@company.com",
  "password": "Password123",
  "role": "employee",
  "managerId": 2,
  "department": "Engineering"
}
```

#### Get All Users
```http
GET /api/users
Authorization: Bearer <token>
```

#### Update User
```http
PUT /api/users/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Doe",
  "department": "Sales"
}
```

#### Change User Role
```http
PUT /api/users/:id/role
Authorization: Bearer <token>
Content-Type: application/json

{
  "role": "manager"
}
```

#### Assign Manager
```http
PUT /api/users/:id/manager
Authorization: Bearer <token>
Content-Type: application/json

{
  "managerId": 3
}
```

### Expense Management

#### Create Expense
```http
POST /api/expenses
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Client dinner",
  "description": "Dinner with ABC Corp",
  "amount": 150.00,
  "category": "food",
  "date": "2024-01-15"
}
```

#### Get Expenses
```http
GET /api/expenses?status=pending&category=travel
Authorization: Bearer <token>
```

#### Get Expense by ID
```http
GET /api/expenses/:id
Authorization: Bearer <token>
```

#### Update Expense
```http
PUT /api/expenses/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated title",
  "amount": 175.00
}
```

#### Delete Expense
```http
DELETE /api/expenses/:id
Authorization: Bearer <token>
```

### Approval Workflow

#### Create Approval Flow (Admin)
```http
POST /api/approvals/flows
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Standard Approval",
  "minAmount": 0,
  "maxAmount": 1000,
  "approvalLevels": 2
}
```

#### Get Pending Approvals (Manager/Admin)
```http
GET /api/approvals/pending
Authorization: Bearer <token>
```

#### Approve Expense
```http
POST /api/approvals/:expenseId/approve
Authorization: Bearer <token>
Content-Type: application/json

{
  "comments": "Approved for business purpose"
}
```

#### Reject Expense
```http
POST /api/approvals/:expenseId/reject
Authorization: Bearer <token>
Content-Type: application/json

{
  "comments": "Missing receipt"
}
```

## Database Schema

### Key Tables

**companies**
- id, name, currency, country, isActive

**users**
- id, firstName, lastName, email, password (hashed), role, companyId, managerId, department, isActive

**expenses**
- id, title, description, amount, currency, category, date, status, currentApprovalLevel, userId, companyId, receipt, remarks

**approval_flows**
- id, name, minAmount, maxAmount, approvalLevels, companyId, isActive

**approval_history**
- id, expenseId, approverId, level, action, comments, actionDate

## Key Features Explained

### Multi-Level Approval Workflow

1. Admin creates approval flows based on expense amounts
2. When employee submits expense, system:
   - Finds matching approval flow
   - Traverses manager hierarchy
   - Creates approval records for each level
   - Sets status to "processing"
3. Approvers see pending items in their queue
4. Each approval moves to next level
5. Final approval changes status to "approved"
6. Any rejection stops the chain

### Role-Based Access Control

- **Admin**: Full access to all resources
- **Manager**: Can approve expenses, view team data
- **Employee**: Can only manage own expenses

Implemented via middleware:
```javascript
router.get('/pending', isManagerOrAdmin, getPendingApprovals);
router.post('/', isAdmin, createUser);
```

### Security Features

- JWT-based authentication
- Password hashing with bcrypt (10 salt rounds)
- Password validation (min 8 chars, uppercase, lowercase, number)
- Role-based route protection
- Input validation with express-validator
- SQL injection prevention via Sequelize ORM

## Default Categories

- travel
- food
- accommodation
- transportation
- supplies
- other

## Default Statuses

- **pending**: Just submitted, no approval flow assigned
- **processing**: In approval workflow
- **approved**: All approvals complete
- **rejected**: Rejected at any level

## Common Issues & Solutions

### Database Connection Error
**Error**: `Unable to connect to the database`  
**Solution**: Check MySQL is running and credentials in `.env` are correct

### JWT Token Invalid
**Error**: `Not authorized, token failed`  
**Solution**: Token may be expired (7 days default). Login again.

### Password Validation Fails
**Error**: `Password must contain uppercase, lowercase, and number`  
**Solution**: Ensure password meets requirements (min 8 chars, mixed case, number)

### Expense Not Entering Approval
**Issue**: Expense stays in "pending"  
**Solution**: Create an approval flow that covers the expense amount range

### Can't Approve Expense
**Error**: `This is not the current approval level`  
**Solution**: Someone else needs to approve the current level first

## Development

### Running Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Building for Production

**Backend:**
```bash
cd backend
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Contact

Repository: [https://github.com/shivanisbhat/expense-final](https://github.com/shivanisbhat/expense-final)

## Acknowledgments

- Express.js for the backend framework
- React for the frontend library
- Sequelize for ORM
- Tailwind CSS for styling
