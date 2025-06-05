import LoginForm from "@/components/LoginForm";
import { Link } from "react-router-dom";

const LoginPage = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-[#181818]">
    <LoginForm />
    <div className="mt-4 text-sm text-gray-400">
      Нет аккаунта? <Link to="/register" className="text-blue-400 hover:underline">Зарегистрироваться</Link>
    </div>
  </div>
);

export default LoginPage; 