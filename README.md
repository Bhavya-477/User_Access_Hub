# 🧭 User Access Management System

A full-stack application for managing software access within an organization. Users can register, request software access, and managers can approve or reject requests. Admins manage the software listing.

---

## 🚀 Tech Stack

**Backend**  
- Node.js  
- Express.js  
- TypeORM  
- PostgreSQL  
- JWT Authentication  
- bcrypt  
- dotenv  
- nodemon  

**Frontend**  
- React  
- Axios  
- React Router DOM  

---

## 📌 Features

### 👤 User Authentication
- User registration with hashed passwords (`bcrypt`)
- Login with JWT-based authentication
- Role-based redirection (Employee, Manager, Admin)

### 🗃️ Roles & Permissions

| Role     | Capabilities                                           |
|----------|--------------------------------------------------------|
| Employee | Register, login, request software access               |
| Manager  | Approve or reject access requests                      |
| Admin    | Create and manage software entries                     |

### 🧩 Functional Modules
- **Sign-Up/Login** (JWT-based)
- **Software Management** (Admin only)
- **Access Request Submission** (Employee)
- **Access Request Approval** (Manager)

---

## 📂 Project Structure

```
/client             --> React frontend  
/server             --> Express backend  
  └── /entities     --> TypeORM entities  
  └── /routes       --> Route handlers  
  └── /middleware   --> Auth and role middleware  
  └── /controllers  --> Business logic  
  └── /config       --> DB and env config  
```

---

## 🛠️ API Endpoints

### 🔐 Auth
- `POST /api/auth/signup` – Register user (default role: Employee)
- `POST /api/auth/login` – Login and receive JWT + role

### 💾 Software (Admin)
- `POST /api/software` – Create new software  
  **Fields**: `name`, `description`, `accessLevels[]`

### 📤 Access Requests (Employee)
- `POST /api/requests` – Submit request  
  **Fields**: `softwareId`, `accessType`, `reason`

### ✅ Request Approval (Manager)
- `PATCH /api/requests/:id` – Approve or reject request  
  **Fields**: `status` (`Approved` / `Rejected`)

---

## 💻 React Pages

| Route               | Description                        |
|--------------------|------------------------------------|
| `/signup`           | User registration form             |
| `/login`            | User login form                    |
| `/create-software`  | Admin: Create new software         |
| `/request-access`   | Employee: Submit access request    |
| `/pending-requests` | Manager: Manage requests           |

---

## 🗄️ Database Schema (TypeORM)

### `User`
```ts
@Entity()
class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column()
  role: 'Employee' | 'Manager' | 'Admin';
}
```

### `Software`
```ts
@Entity()
class Software {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column("simple-array")
  accessLevels: string[]; // e.g., ['Read', 'Write', 'Admin']
}
```

### `Request`
```ts
@Entity()
class Request {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => Software)
  software: Software;

  @Column()
  accessType: 'Read' | 'Write' | 'Admin';

  @Column('text')
  reason: string;

  @Column()
  status: 'Pending' | 'Approved' | 'Rejected';
}
```

---

## ⚙️ Setup Instructions

### 📁 Backend Setup
```bash
cd server
npm install
npm run dev
```

> Create a `.env` file inside `/server`:
```
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_pass
DB_NAME=user_access_db
JWT_SECRET=your_jwt_secret
```

### 💻 Frontend Setup
```bash
cd client
npm install
npm start
```

## ✅ Evaluation Criteria

| Criteria         | Description                                          |
|------------------|------------------------------------------------------|
| Functionality     | Auth, request creation, approval handling            |
| Code Structure    | Clean foldering, modular code                        |
| Security          | JWT, hashed passwords                               |
| DB Integration    | Proper TypeORM schema & relationships                |
| Completeness      | All required features fully functional               |

---

## ✍️ Author

Bhavya Sri – [GitHub](https://github.com/Bhavya-477)
