import React from 'react';
import { cn } from "@/lib/utils";

interface ChatHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

const ChatHeader = ({ className, ...props }: ChatHeaderProps) => {
  return (
    <div 
      className={cn(
        "flex items-center justify-center p-4 border-b border-border/30 glass-effect sticky top-0 z-10",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-leaf flex items-center justify-center">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="text-white"
          >
            <path d="M2 22c1.25-1.25 2.5-2.5 3.5-4 .83-1.25 1.5-2.5 1.5-4-.83.83-2 1.5-3 1.5C2 15.5.5 14 .5 12S2 8.5 4 8.5c0-1.5.5-3 2-4 1.5-1 3-1.5 4.5-1 0 0 .5 1 .5 2 0 2-1 4.5-1 6.5 0 1.25.5 2 1 2.5"/>
            <path d="M10 19c-.65-1.95-1-3.25-1-5.5m0 0c0-2.5 1-5 2-7 0 0 1.03 1 2 2 1.5 1.5 3 4 3 6s-1 4-3 6"/>
            <path d="M18 22c1.25-1.25 2.5-2.5 3.5-4 .83-1.25 1.5-2.5 1.5-4-.83.83-2 1.5-3 1.5-2 0-3.5-1.5-3.5-3.5S17 8.5 19 8.5c0-1.5.5-3 2-4 1.5-1 3-1.5 4.5-1 0 0 .5 1 .5 2 0 2-1 4.5-1 6.5 0 1.25.5 2 1 2.5"/>
          </svg>
        </div>
        <h1 className="text-xl font-semibold">Leaf Whisper</h1>
      </div>
    </div>
  );
};

export default ChatHeader;
