# 🚀 Task Manager Cloud - Full Stack Pro

A professional, full-stack task management application built with **Next.js**, **ASP.NET Core**, **MySQL**, and **Firebase**. This project demonstrates clean architecture, cloud-to-cloud integration, and premium UI/UX design.

## 🔗 Live Demo
- **Live Site:** [https://task-manager-three-bice-55.vercel.app/](https://task-manager-three-bice-55.vercel.app/)

---

## ✨ Features
- **Firebase Authentication:** Secure Email/Password registration and login.
- **Full CRUD Operations:** Create, Read, Update, and Delete tasks with real-time feedback.
- **Smart Filtering:** Filter tasks by "All", "In Progress", "Completed", or "Needs Attention".
- **Premium UI/UX:** A cinematic glassmorphism dashboard with smooth Framer Motion animations.
- **Cloud Database:** Persistent storage using Aiven Cloud MySQL.
- **Security:** Owner-scoping (users can only see their own tasks) via Firebase UID validation.

---

## 🛠️ Tech Stack
| Tier | Technology |
| :--- | :--- |
| **Frontend** | Next.js 16 (App Router), Tailwind CSS, Framer Motion, Material UI (MUI) |
| **Backend** | ASP.NET Core 10.0, Entity Framework Core |
| **Database** | MySQL (Aiven Cloud) |
| **Auth** | Firebase Authentication (JWT Validation) |
| **Deployment** | Vercel (Frontend), Railway (Backend/Docker) |

---

## 📁 Project Structure
- `/frontend`: Next.js application.
- `/backend`: ASP.NET Core Web API.
- `Dockerfile`: Production deployment configuration for Railway.

---

## ⚙️ Local Setup Instructions

### Prerequisites
- .NET 10.0 SDK
- Node.js (v18+)
- MySQL (Local or Cloud instance)
- Firebase Project

### 1. Backend Setup
1. Navigate to `/backend/TaskManager.API`.
2. Update `appsettings.Development.json` with your MySQL connection string.
3. Place your `firebase-service-account.json` in the root of the project.
4. Run migrations:
   ```bash
   dotnet ef database update
   ```
5. Start the API:
   ```bash
   dotnet run
   ```

### 2. Frontend Setup
1. Navigate to `/frontend`.
2. Create a `.env.local` file and add your Firebase credentials and API URL:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_key
   NEXT_PUBLIC_API_URL=http://localhost:5189
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

---

## ☁️ Deployment Notes

### Railway (Backend)
- Pass your Firebase Secret as an environment variable: `FIREBASE_JSON`.
- Set `ConnectionStrings__DefaultConnection` for your MySQL instance.
- Enable `SslMode=Required` for Aiven connections.

### Vercel (Frontend)
- Set `NEXT_PUBLIC_API_URL` to your Railway URL.
- Configure all `NEXT_PUBLIC_FIREBASE_*` variables.
- Set the **Root Directory** to `frontend`.

---

## 📜 Documentation & API Endpoints
- `GET /api/tasks` - Fetch user tasks.
- `POST /api/tasks` - Create a task.
- `PUT /api/tasks/{id}` - Update task details.
- `DELETE /api/tasks/{id}` - Remove a task.

---

## 👨‍💻 Author
**Thisanga Dinath**  
Built as part of a professional coding challenge. 🚀
