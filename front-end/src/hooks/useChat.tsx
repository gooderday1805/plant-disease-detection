import { useState, useEffect } from 'react';
import { Message } from '@/types';
import { predictDisease, getWeatherData } from '@/services/api';
import * as SessionStorage from '@/utils/sessionStorage';
import { useToast } from '@/hooks/use-toast';

interface UseChatResult {
  messages: Message[];
  isLoading: boolean;
  sessionId: string;
  locationDialogOpen: boolean;
  currentMessageId: string;
  handleSendMessage: (text: string, image: File | null) => Promise<void>;
  handleRequestLocation: (messageId: string) => void;
  handleLocationSubmit: (values: { location: string }) => Promise<void>;
  handleClearChat: () => void;
  setLocationDialogOpen: (open: boolean) => void;
}

export const useChat = (): UseChatResult => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [locationDialogOpen, setLocationDialogOpen] = useState(false);
  const [currentMessageId, setCurrentMessageId] = useState<string>('');
  const { toast } = useToast();

  // Initialize session from localStorage
  useEffect(() => {
    try {
      const currentSession = SessionStorage.getCurrentSession();
      setSessionId(currentSession.id);
      setMessages(currentSession.messages);
    } catch (error) {
      console.error('Error loading session:', error);
      // Create new session if there's an error
      const newSession = SessionStorage.createSession();
      setSessionId(newSession.id);
    }
  }, []);

  const handleSendMessage = async (text: string, image: File | null) => {
    if (!text.trim() && !image) return;

    let imageUrl = '';
    
    // If there's an image, create a local URL for display
    if (image) {
      imageUrl = URL.createObjectURL(image);
    }

    // Create and add user message
    const userMessage: Message = {
      id: SessionStorage.generateId(),
      role: 'user',
      content: text.trim(),
      ...(imageUrl && { image: imageUrl }),
      timestamp: Date.now()
    };

    // Update UI
    setMessages(prev => [...prev, userMessage]);
    
    // Save to session storage
    SessionStorage.addMessage(sessionId, userMessage);

    // Set loading state
    setIsLoading(true);

    try {
      // Call API
      const response = await predictDisease({
        text: text.trim() || undefined,
        image: image || undefined
      });

      // Check if response has disease_name (image response) or message (text response)
      if ('disease_name' in response) {
        // Image response - create location request system message
        const locationRequestMessage: Message = {
          id: SessionStorage.generateId(),
          role: 'system',
          content: `Kết quả chẩn đoán: ${response.disease_name}`,
          timestamp: Date.now(),
          diseaseInfo: response,
          isLocationRequest: true
        };

        // Update UI with location request message
        setMessages(prev => [...prev, locationRequestMessage]);
        
        // Save to session storage
        SessionStorage.addMessage(sessionId, locationRequestMessage);
      } else if ('message' in response) {
        // Text response - show message from Gemini API
        const textResponseMessage: Message = {
          id: SessionStorage.generateId(),
          role: 'system',
          content: response.message,
          timestamp: Date.now()
        };

        // Update UI with text response message
        setMessages(prev => [...prev, textResponseMessage]);
        
        // Save to session storage
        SessionStorage.addMessage(sessionId, textResponseMessage);
      }
    } catch (error) {
      console.error('Error getting prediction:', error);
      toast({
        title: "Lỗi",
        description: "Không thể nhận chẩn đoán. Vui lòng thử lại.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestLocation = (messageId: string) => {
    setCurrentMessageId(messageId);
    setLocationDialogOpen(true);
  };

  const handleLocationSubmit = async (values: { location: string }) => {
    setLocationDialogOpen(false);
    
    if (!values.location.trim()) return;
    
    // Add user message with location
    const userLocationMessage: Message = {
      id: SessionStorage.generateId(),
      role: 'user',
      content: `Vị trí của tôi: ${values.location}`,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userLocationMessage]);
    SessionStorage.addMessage(sessionId, userLocationMessage);

    // Show loading
    setIsLoading(true);

    try {
      // Call the backend API - it returns { message: location }
      const weatherData = await getWeatherData(values.location);
      
      // Create system message with the response
      const weatherMessage: Message = {
        id: SessionStorage.generateId(),
        role: 'system',
        content: weatherData.message || `Đã nhận vị trí: ${values.location}`,
        timestamp: Date.now()
      };

      // Update messages
      setMessages(prev => [...prev, weatherMessage]);
      
      // Save to session storage
      SessionStorage.addMessage(sessionId, weatherMessage);

      toast({
        title: "Thông tin vị trí",
        description: `Đã cập nhật vị trí: ${values.location}`,
      });
    } catch (error) {
      console.error('Error getting weather data:', error);
      toast({
        title: "Lỗi",
        description: "Không thể lấy thông tin vị trí. Vui lòng thử lại.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    // Create new session
    const newSession = SessionStorage.createSession();
    setSessionId(newSession.id);
    setMessages([]);
    
    toast({
      title: "Đã xóa cuộc trò chuyện",
      description: "Bắt đầu cuộc hội thoại mới",
    });
  };

  return {
    messages,
    isLoading,
    sessionId,
    locationDialogOpen,
    currentMessageId,
    handleSendMessage,
    handleRequestLocation,
    handleLocationSubmit,
    handleClearChat,
    setLocationDialogOpen
  };
};
