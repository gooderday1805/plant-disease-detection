import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { cn } from '@/lib/utils';
import { Image, Loader, Send } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (text: string, image: File | null) => void;
  isLoading: boolean;
}

const ChatInput = ({ onSendMessage, isLoading }: ChatInputProps) => {
  const [message, setMessage] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if ((message.trim() || image) && !isLoading) {
      onSendMessage(message, image);
      setMessage('');
      setImage(null);
      setImagePreview(null);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setImage(selectedFile);
      
      // Create image preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const clearImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="p-4 border-t border-border/30 glass-effect sticky bottom-0 z-10"
    >
      {imagePreview && (
        <div className="mb-2 relative inline-block">
          <img 
            src={imagePreview} 
            alt="Preview" 
            className="h-20 rounded-md object-cover"
          />
          <Button 
            type="button" 
            variant="destructive" 
            size="icon" 
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
            onClick={clearImage}
          >
            ×
          </Button>
        </div>
      )}
      
      <div className="flex gap-2 items-center">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          className="bg-secondary hover:bg-secondary/80 border-border/50"
        >
          <Image size={20} className="text-muted-foreground" />
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
        </Button>
        
        <div className="relative flex-1">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Mô tả triệu chứng hoặc tải ảnh lên..."
            className={cn(
              "w-full rounded-full py-3 px-4 pr-12 bg-secondary border-border/50",
              "focus:outline-none focus:ring-1 focus:ring-primary",
              "placeholder:text-muted-foreground text-foreground",
              isLoading ? "opacity-80 cursor-not-allowed" : ""
            )}
            disabled={isLoading}
          />
          <Button
            type="submit"
            size="icon"
            variant="ghost"
            className={cn(
              "absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8",
              "hover:bg-primary/20 text-primary",
              (!message.trim() && !image) || isLoading ? "opacity-60 cursor-not-allowed" : "",
            )}
            disabled={(!message.trim() && !image) || isLoading}
          >
            {isLoading ? (
              <Loader size={18} className="animate-spin" />
            ) : (
              <Send size={18} />
            )}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default ChatInput;
