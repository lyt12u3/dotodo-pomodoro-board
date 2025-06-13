import { useState } from 'react';
import Header from '../components/Header';
import { useTimeBlocks, TimeBlock } from '../contexts/TimeBlockContext';
import { Trash2, Plus } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const TimeBlocking = () => {
  const { timeBlocks, addTimeBlock, updateTimeBlock, deleteTimeBlock, getTotalTime } = useTimeBlocks();
  const { toast } = useToast();
  
  const [name, setName] = useState('');
  const [duration, setDuration] = useState('');
  const [color, setColor] = useState('#3B82F6');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [blockToDelete, setBlockToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const availableColors = [
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#F97316', // Orange
  ];

  const handleAddTimeBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !duration.trim()) {
      toast({
        title: "Error",
        description: "Name and duration are required",
        variant: "destructive",
      });
      return;
    }
    
    const durationMinutes = parseInt(duration);
    
    if (isNaN(durationMinutes) || durationMinutes <= 0) {
      toast({
        title: "Error",
        description: "Duration must be a positive number",
        variant: "destructive",
      });
      return;
    }

    if (durationMinutes > 24 * 60) {
      toast({
        title: "Error",
        description: "Duration cannot be more than 24 hours",
        variant: "destructive",
      });
      return;
    }

    const totalTime = getTotalTime();
    if (totalTime + durationMinutes > 24 * 60) {
      toast({
        title: "Error",
        description: "Total time cannot exceed 24 hours",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      await addTimeBlock({
        name: name.trim(),
        duration: durationMinutes,
        color,
      });
      
      setName('');
      setDuration('');
      toast({
        title: "Time block added",
        description: `${name} (${durationMinutes} min) has been added to your schedule.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add time block",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTimeBlock = async (id: string) => {
    setIsDeleting(true);
    try {
      await deleteTimeBlock(id);
      toast({
        title: "Time block deleted",
        variant: "destructive",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete time block",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setBlockToDelete(null);
    }
  };

  const totalTime = getTotalTime();
  const restTime = 24 * 60 - totalTime;
  const totalHours = Math.floor(totalTime / 60);
  const totalMinutes = totalTime % 60;
  
  return (
    <>
      <Header title="Time blocking" />
      
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          {timeBlocks.map(block => (
            <div 
              key={block.id}
              className="time-block animate-in fade-in slide-in-from-left-5"
              style={{ backgroundColor: block.color }}
            >
              <div>
                <div className="font-medium">{block.name}</div>
                <div className="text-sm opacity-80">{block.duration} min.</div>
              </div>
              <button
                onClick={() => setBlockToDelete(block.id)}
                disabled={isDeleting}
                className="p-1 rounded hover:bg-black/20 transition-colors disabled:opacity-50"
              >
                {isDeleting && blockToDelete === block.id ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </button>
            </div>
          ))}
          
          <div className="mt-4 text-sm text-gray-400 animate-in fade-in">
            {totalHours}h {totalMinutes}m used, {Math.floor(restTime / 60)}h {restTime % 60}m remaining
          </div>
        </div>
        
        <div>
          <form onSubmit={handleAddTimeBlock} className="bg-card p-4 rounded-lg shadow-md">
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium mb-1">
                Enter name:
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 rounded bg-secondary text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter name"
                disabled={isSubmitting}
                maxLength={50}
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="duration" className="block text-sm font-medium mb-1">
                Enter duration (min.):
              </label>
              <input
                id="duration"
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full p-2 rounded bg-secondary text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter duration"
                disabled={isSubmitting}
                min="1"
                max="1440"
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium mb-1">
                Color:
              </label>
              <div className="flex flex-wrap gap-2">
                {availableColors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`w-8 h-8 rounded-full transition-all ${color === c ? 'ring-2 ring-white scale-110' : 'hover:scale-105'}`}
                    style={{ backgroundColor: c }}
                    onClick={() => setColor(c)}
                    disabled={isSubmitting}
                  />
                ))}
              </div>
            </div>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/80 flex items-center justify-center gap-2 w-full transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Create
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      <AlertDialog open={!!blockToDelete} onOpenChange={(open) => !open && setBlockToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete time block</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this time block? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => blockToDelete && handleDeleteTimeBlock(blockToDelete)}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600 focus:ring-red-500"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default TimeBlocking;
