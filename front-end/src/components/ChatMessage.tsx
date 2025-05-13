
import React from 'react';
import { cn } from "@/lib/utils";
import { Message } from '@/types';
import DiseaseDetails from './DiseaseDetails';
import { Button } from '@/components/ui/button';

interface ChatMessageProps {
  message: Message;
  onRequestLocation: (messageId: string) => void;
}

const ChatMessage = ({ message, onRequestLocation }: ChatMessageProps) => {
  const isUser = message.role === 'user';
  
  return (
    <div className={cn(
      "flex w-full mb-4 animate-in fade-in duration-300",
      isUser ? "justify-end" : "justify-start"
    )}>
      <div className={cn(
        "flex items-start gap-3 max-w-[80%] md:max-w-[70%]",
        isUser ? "flex-row-reverse" : ""
      )}>
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
          isUser ? "bg-primary" : "bg-leaf-dark"
        )}>
          {isUser ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-foreground">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-foreground">
              <path d="M2 22c1.25-1.25 2.5-2.5 3.5-4 .83-1.25 1.5-2.5 1.5-4"></path>
              <path d="M10 19c-.65-1.95-1-3.25-1-5.5 0-2.5 1-5 2-7 0 0 1.03 1 2 2 1.5 1.5 3 4 3 6s-1 4-3 6"></path>
              <path d="M18 22c1.25-1.25 2.5-2.5 3.5-4 .83-1.25 1.5-2.5 1.5-4"></path>
            </svg>
          )}
        </div>
        
        <div className={cn(
          "py-3 px-4 rounded-2xl",
          isUser 
            ? "bg-primary text-primary-foreground rounded-tr-none" 
            : "bg-secondary text-secondary-foreground rounded-tl-none"
        )}>
          {message.content}
          
          {message.image && (
            <div className="mt-2 max-w-xs">
              <img 
                src={message.image} 
                alt="Uploaded leaf image" 
                className="rounded-md max-w-full h-auto object-cover"
              />
            </div>
          )}
          
          {message.isLocationRequest && !isUser && (
            <div className="mt-3">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onRequestLocation(message.id)}
                className="w-full bg-secondary/50 text-primary hover:bg-secondary hover:text-primary"
              >
                Cung cấp vị trí của bạn
              </Button>
            </div>
          )}
          
          {message.diseaseInfo && !isUser && (
            <DiseaseDetails 
              diseaseInfo={message.diseaseInfo} 
              weatherInfo={message.weatherInfo}
              onRequestLocation={() => onRequestLocation(message.id)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
