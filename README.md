# DoTodo Pomodoro Board

DoTodo Pomodoro Board is a powerful and intuitive application designed to boost your productivity by combining the Pomodoro Technique with a flexible to-do list. Manage your tasks, stay focused, and achieve your goals with this all-in-one solution.

## ✨ Features

- **📝 Task Management:** Create, organize, and prioritize your tasks with ease.
- **🍅 Pomodoro Timer:** Integrated Pomodoro timer to help you stay focused and manage your time effectively.
- **📊 Progress Tracking:** Visualize your progress and stay motivated with insightful statistics.
- **🎨 Customizable Interface:** Personalize the app to match your preferences with themes and custom settings.
- **📱 Responsive Design:** Access your tasks and timer on any device, whether it's your desktop, tablet, or smartphone.

## 🚀 Technologies Used

### Frontend

- **Framework:** React
- **Build Tool:** Vite
- **UI Library:** shadcn/ui (built on Radix UI and Tailwind CSS)
- **State Management:** TanStack Query (React Query)
- **Routing:** React Router
- **Form Handling:** React Hook Form
- **Schema Validation:** Zod
- **Styling:** Tailwind CSS, clsx, tailwind-merge
- **Linting & Formatting:** ESLint, Prettier
- **Language:** TypeScript

### Backend

- **Framework:** NestJS
- **Database ORM:** Prisma
- **Authentication:** Passport.js (JWT strategy)
- **Password Hashing:** Argon2, bcrypt
- **Data Validation:** class-validator, class-transformer
- **Configuration Management:** @nestjs/config
- **Language:** TypeScript
- **Testing:** Jest, Supertest

## 🏁 Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or bun (or yarn)
- A running instance of a PostgreSQL database (or your preferred database configured in Prisma)

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/dotodo-pomodoro-board.git
    cd dotodo-pomodoro-board
    ```

2.  **Backend Setup:**
    ```bash
    cd backend
    npm install # or bun install or yarn install

    # Create a .env file in the backend directory based on .env.example (if available)
    # or configure the following environment variables:
    # DATABASE_URL="postgresql://user:password@host:port/database"
    # JWT_SECRET="your-super-secret-jwt-key"
    # JWT_EXPIRATION_TIME="3600s" # Example: 1 hour

    # Apply database migrations
    npx prisma migrate dev

    # Seed the database (if a seed script is available)
    # npx prisma db seed

    npm run start:dev
    ```
    The backend server will start on `http://localhost:3000` (or the port configured in your environment).

3.  **Frontend Setup:**
    Open a new terminal window.
    ```bash
    cd frontend
    npm install # or bun install or yarn install

    # Create a .env file in the frontend directory if needed
    # Example:
    # VITE_API_BASE_URL=http://localhost:3000/api

    npm run dev
    ```
    The frontend development server will start on `http://localhost:5173` (or another available port if 5173 is in use).

### Available Scripts

#### Backend (`/backend` directory)

-   `npm run build`: Build the application for production.
-   `npm run format`: Format code using Prettier.
-   `npm run start`: Start the application (production mode).
-   `npm run start:dev`: Start the application in development mode with watch.
-   `npm run start:debug`: Start the application in debug mode with watch.
-   `npm run lint`: Lint the codebase.
-   `npm run test`: Run unit tests.
-   `npm run test:watch`: Run unit tests in watch mode.
-   `npm run test:cov`: Generate a test coverage report.
-   `npm run test:e2e`: Run end-to-end tests.

#### Frontend (`/frontend` directory)

-   `npm run dev`: Start the development server.
-   `npm run build`: Build the application for production.
-   `npm run build:dev`: Build the application for development (non-minified).
-   `npm run lint`: Lint the codebase.
-   `npm run preview`: Preview the production build locally.

## 🛠️ Architecture

The application follows a client-server architecture:

-   **Frontend:** A single-page application (SPA) built with React and Vite. It handles user interaction, displays data, and communicates with the backend API.
-   **Backend:** A RESTful API built with NestJS. It manages business logic, interacts with the database (via Prisma), and handles authentication and authorization.

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/your-feature-name`).
3.  Make your changes.
4.  Commit your changes (`git commit -m 'Add some feature'`).
5.  Push to the branch (`git push origin feature/your-feature-name`).
6.  Open a Pull Request.

Please ensure your code adheres to the project's coding standards and includes tests where appropriate.

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📧 Contact

If you have any questions, issues, or suggestions, please open an issue on GitHub or contact the project maintainer.

---

Made with ❤️ for enhanced productivity! 