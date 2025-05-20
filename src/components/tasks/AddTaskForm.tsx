
import { useState } from "react";
import { useTasks, Priority } from "@/contexts/TaskContext";
import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type AddTaskFormProps = {
  group: "today" | "tomorrow" | "thisWeek" | "nextWeek" | "later";
};

const AddTaskForm = ({ group }: AddTaskFormProps) => {
  const { addTask } = useTasks();
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Priority | null>(null);
  const [date, setDate] = useState<Date | undefined>(undefined);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      addTask({
        title: title.trim(),
        completed: false,
        dueDate: date ? date.toISOString() : null,
        priority,
        group,
      });
      resetForm();
    }
  };

  const resetForm = () => {
    setTitle("");
    setPriority(null);
    setDate(undefined);
    setIsAdding(false);
  };

  if (!isAdding) {
    return (
      <button
        onClick={() => setIsAdding(true)}
        className="flex items-center gap-2 py-2 px-1 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded w-full"
      >
        <Plus size={16} />
        <span>Add task...</span>
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="py-2 px-1 space-y-2">
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Task name"
        className="bg-gray-900 border-gray-700"
        autoFocus
      />
      
      <div className="flex gap-2">
        <Select onValueChange={(value) => setPriority(value as Priority)}>
          <SelectTrigger className="bg-gray-900 border-gray-700 w-1/2">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-1/2 justify-start text-left font-normal bg-gray-900 border-gray-700",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-gray-900 border-gray-700">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={resetForm}>
          Cancel
        </Button>
        <Button type="submit">Add</Button>
      </div>
    </form>
  );
};

export default AddTaskForm;
