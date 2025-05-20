import { useState } from "react";
import { usePomodoro } from "@/contexts/PomodoroContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const { settings, updateSettings } = usePomodoro();
  const { toast } = useToast();
  
  const [workInterval, setWorkInterval] = useState(String(settings.workInterval));
  const [breakInterval, setBreakInterval] = useState(String(settings.breakInterval));

  const handleSave = () => {
    // Update pomodoro settings
    updateSettings({
      workInterval: parseInt(workInterval),
      breakInterval: parseInt(breakInterval),
    });
    
    toast({
      title: "Settings saved",
      description: "Your settings have been updated successfully",
    });
  };
  
  return (
    <div className="flex-1 p-6">
      <div className="max-w-xl mx-auto bg-[#1a1a1a] rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Work interval (min.):</label>
            <Input 
              type="number" 
              value={workInterval}
              onChange={(e) => setWorkInterval(e.target.value)}
              className="bg-gray-900 border-gray-700" 
              min={1}
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-300 mb-1">Break interval (min.):</label>
            <Input 
              type="number" 
              value={breakInterval}
              onChange={(e) => setBreakInterval(e.target.value)}
              className="bg-gray-900 border-gray-700" 
              min={1}
            />
          </div>
        </div>
        
        <Button
          onClick={handleSave}
          className="mt-6 bg-purple-600 hover:bg-purple-700"
        >
          Save
        </Button>
      </div>
    </div>
  );
};

export default Settings; 