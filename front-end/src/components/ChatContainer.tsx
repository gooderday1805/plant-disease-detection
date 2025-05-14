import React, { useRef } from 'react';
import ChatMessage from '@/components/ChatMessage';
import WelcomeMessage from '@/components/WelcomeMessage';
import { Button } from '@/components/ui/button';
import { Message } from '@/types';

interface ChatContainerProps {
  messages: Message[];
  onClearChat: () => void;
  onRequestLocation: (messageId: string) => void;
}

const ChatContainer = ({ messages, onClearChat, onRequestLocation }: ChatContainerProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Scroll to bottom when messages change
  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (messages.length === 0) {
    return <WelcomeMessage />;
  }

  return (
    <>
      <div className="flex justify-center mb-6">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onClearChat}
          className="text-xs bg-secondary/50 hover:bg-secondary border-border/50"
        >
          Cuộc trò chuyện mới
        </Button>
      </div>
      
      {messages.map((message) => (
        <ChatMessage 
          key={message.id} 
          message={message}
          onRequestLocation={onRequestLocation} 
        />
      ))}
      <div ref={messagesEndRef} />
    </>
  );
};

export default ChatContainer;
