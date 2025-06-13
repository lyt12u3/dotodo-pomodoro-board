import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { TaskProvider } from "@/contexts/TaskContext";
import { PomodoroProvider } from "@/contexts/PomodoroContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { TimeBlockProvider } from "@/contexts/TimeBlockContext";

import MainLayout from "./components/AppLayout";
import Tasks from "./pages/Tasks";
import Pomodoro from "./pages/Pomodoro";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dasboard";
import TimeBlocking from "./pages/TimeBlocking";

const queryClient = new QueryClient();

const App = () => (
  <AuthProvider>
    <QueryClientProvider client={queryClient}>
      <TaskProvider>
        <PomodoroProvider>
          <TimeBlockProvider>
            <TooltipProvider>
              <Toaster />
              <BrowserRouter>
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route element={<MainLayout />}>
                    <Route path="/tasks" element={<Tasks />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/time-blocking" element={<TimeBlocking />} />
                    <Route path="/pomodoro" element={<Pomodoro />} />
                    <Route path="/settings" element={<Settings />} />
                  </Route>
                  
                  {/* Redirect root to tasks */}
                  <Route path="/" element={<Navigate to="/tasks" replace />} />
                  
                  {/* Catch all */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </TimeBlockProvider>
        </PomodoroProvider>
      </TaskProvider>
    </QueryClientProvider>
  </AuthProvider>
);

export default App;
