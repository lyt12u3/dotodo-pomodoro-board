import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useTasks } from '../contexts/TaskContext';
import { useToast } from '../hooks/use-toast';
import { CheckCircle, Calendar, CalendarDays, ListTodo } from 'lucide-react';

const Dashboard = () => {
  const { tasks } = useTasks();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);
  
  const completedTasks = tasks.filter(task => task.completed);
  const todayTasks = tasks.filter(task => task.category === 'today');
  const weekTasks = tasks.filter(task => task.category === 'this_week' || task.category === 'next_week');

  const getCompletionRate = () => {
    if (tasks.length === 0) return 0;
    return Math.round((completedTasks.length / tasks.length) * 100);
  };

  const handleCardClick = (path: string) => {
    try {
      navigate(path);
    } catch (error) {
      toast({
        title: "Navigation failed",
        description: "Failed to navigate to the requested page",
        variant: "destructive",
      });
    }
  };

  const StatCard = ({ 
    title, 
    count, 
    onClick,
    icon: Icon,
    description,
    isLoading,
  }: { 
    title: string; 
    count: number;
    onClick?: () => void;
    icon: React.ElementType;
    description: string;
    isLoading: boolean;
  }) => (
    <div 
      className={`bg-card p-6 rounded-lg shadow-md cursor-pointer transition-all hover:scale-105 hover:shadow-lg animate-in fade-in slide-in-from-bottom-2 ${
        isLoading ? 'opacity-50' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base text-gray-400">{title}</h2>
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <p className="text-3xl font-bold mb-2">{isLoading ? '-' : count}</p>
      <p className="text-sm text-gray-400">{description}</p>
    </div>
  );

  return (
    <>
      <Header title="Statistics" />
      
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Tasks" 
            count={tasks.length}
            onClick={() => handleCardClick('/tasks')} 
            icon={ListTodo}
            description={`${getCompletionRate()}% completion rate`}
            isLoading={isLoading}
          />
          <StatCard 
            title="Completed Tasks" 
            count={completedTasks.length}
            onClick={() => handleCardClick('/tasks')} 
            icon={CheckCircle}
            description={`${tasks.length - completedTasks.length} tasks remaining`}
            isLoading={isLoading}
          />
          <StatCard 
            title="Today's Tasks" 
            count={todayTasks.length}
            onClick={() => handleCardClick('/tasks')} 
            icon={Calendar}
            description={`${todayTasks.filter(t => t.completed).length} completed today`}
            isLoading={isLoading}
          />
          <StatCard 
            title="Week's Tasks" 
            count={weekTasks.length}
            onClick={() => handleCardClick('/tasks')} 
            icon={CalendarDays}
            description={`${weekTasks.filter(t => t.completed).length} completed this week`}
            isLoading={isLoading}
          />
        </div>
      </div>
    </>
  );
};

export default Dashboard;
