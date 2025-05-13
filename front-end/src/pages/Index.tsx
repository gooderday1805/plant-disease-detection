
import React from 'react';
import ChatHeader from '@/components/ChatHeader';
import ChatInput from '@/components/ChatInput';
import ChatContainer from '@/components/ChatContainer';
import LocationDialog from '@/components/LocationDialog';
import { useChat } from '@/hooks/useChat';

const Index = () => {
  const {
    messages,
    isLoading,
    locationDialogOpen,
    handleSendMessage,
    handleRequestLocation,
    handleLocationSubmit,
    handleClearChat,
    setLocationDialogOpen
  } = useChat();

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <ChatHeader />
      
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <ChatContainer 
            messages={messages} 
            onClearChat={handleClearChat}
            onRequestLocation={handleRequestLocation}
          />
        </div>
      </div>
      
      <ChatInput 
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
      />

      <LocationDialog
        open={locationDialogOpen}
        onOpenChange={setLocationDialogOpen}
        onSubmit={handleLocationSubmit}
      />
    </div>
  );
};

export default Index;
