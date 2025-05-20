import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { TaskProvider } from "@/contexts/TaskContext";
import { PomodoroProvider } from "@/contexts/PomodoroContext";

import MainLayout from "./components/layout/MainLayout";
import Tasks from "./pages/Tasks";
import Pomodoro from "./pages/Pomodoro";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TaskProvider>
      <PomodoroProvider>
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <Routes>
              <Route element={<MainLayout />}>
                <Route path="/tasks" element={<Tasks />} />
                <Route path="/pomodoro" element={<Pomodoro />} />
              </Route>
              
              {/* Redirect root to tasks */}
              <Route path="/" element={<Navigate to="/tasks" replace />} />
              
              {/* Catch all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </PomodoroProvider>
    </TaskProvider>
  </QueryClientProvider>
);

export default App;
