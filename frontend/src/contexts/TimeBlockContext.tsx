import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface TimeBlock {
  id: string;
  name: string;
  duration: number;
  color: string;
}

interface TimeBlockContextType {
  timeBlocks: TimeBlock[];
  addTimeBlock: (block: Omit<TimeBlock, 'id'>) => void;
  updateTimeBlock: (id: string, block: Partial<TimeBlock>) => void;
  deleteTimeBlock: (id: string) => void;
  getTotalTime: () => number;
}

const TimeBlockContext = createContext<TimeBlockContextType | undefined>(undefined);

export const useTimeBlocks = () => {
  const context = useContext(TimeBlockContext);
  if (!context) {
    throw new Error('useTimeBlocks must be used within a TimeBlockProvider');
  }
  return context;
};

export const TimeBlockProvider = ({ children }: { children: ReactNode }) => {
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([]);

  const addTimeBlock = (block: Omit<TimeBlock, 'id'>) => {
    const newBlock = {
      ...block,
      id: Math.random().toString(36).substr(2, 9),
    };
    setTimeBlocks(prev => [...prev, newBlock]);
  };

  const updateTimeBlock = (id: string, block: Partial<TimeBlock>) => {
    setTimeBlocks(prev =>
      prev.map(b => (b.id === id ? { ...b, ...block } : b))
    );
  };

  const deleteTimeBlock = (id: string) => {
    setTimeBlocks(prev => prev.filter(b => b.id !== id));
  };

  const getTotalTime = () => {
    return timeBlocks.reduce((total, block) => total + block.duration, 0);
  };

  return (
    <TimeBlockContext.Provider
      value={{
        timeBlocks,
        addTimeBlock,
        updateTimeBlock,
        deleteTimeBlock,
        getTotalTime,
      }}
    >
      {children}
    </TimeBlockContext.Provider>
  );
}; 