import PomodoroTimer from "@/components/pomodoro/PomodoroTimer";

const Pomodoro = () => {
  return (
    <div className="flex-1 p-6 flex justify-center items-center h-[calc(100vh-80px)]">
      <PomodoroTimer />
    </div>
  );
};

export default Pomodoro; 