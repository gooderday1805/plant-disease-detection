
import { ChatSession, Message } from '@/types';

const STORAGE_KEY = 'leaf-whisper-sessions';

// Generate a unique ID
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// Get all chat sessions
export const getSessions = (): ChatSession[] => {
  try {
    const sessionsJSON = localStorage.getItem(STORAGE_KEY);
    return sessionsJSON ? JSON.parse(sessionsJSON) : [];
  } catch (error) {
    console.error('Error retrieving sessions from localStorage:', error);
    return [];
  }
};

// Get a specific session by ID
export const getSession = (id: string): ChatSession | null => {
  const sessions = getSessions();
  return sessions.find(session => session.id === id) || null;
};

// Get the current/latest session
export const getCurrentSession = (): ChatSession => {
  const sessions = getSessions();
  // Get the most recently updated session, or create a new one
  if (sessions.length > 0) {
    // Sort by updatedAt in descending order
    const sortedSessions = [...sessions].sort((a, b) => b.updatedAt - a.updatedAt);
    return sortedSessions[0];
  }
  
  // Create a new session if none exists
  return createSession();
};

// Create a new chat session
export const createSession = (): ChatSession => {
  const newSession: ChatSession = {
    id: generateId(),
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  
  saveSession(newSession);
  return newSession;
};

// Save a chat session
export const saveSession = (session: ChatSession): void => {
  try {
    const sessions = getSessions();
    const existingIndex = sessions.findIndex(s => s.id === session.id);
    
    // Update the updatedAt timestamp
    session.updatedAt = Date.now();
    
    if (existingIndex !== -1) {
      // Update existing session
      sessions[existingIndex] = session;
    } else {
      // Add new session
      sessions.push(session);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch (error) {
    console.error('Error saving session to localStorage:', error);
  }
};

// Add a message to a session
export const addMessage = (sessionId: string, message: Message): void => {
  const session = getSession(sessionId);
  if (session) {
    session.messages.push(message);
    session.updatedAt = Date.now();
    saveSession(session);
  }
};

// Update a message in a session
export const updateMessage = (sessionId: string, updatedMessage: Message): void => {
  const session = getSession(sessionId);
  if (session) {
    const messageIndex = session.messages.findIndex(msg => msg.id === updatedMessage.id);
    if (messageIndex !== -1) {
      session.messages[messageIndex] = updatedMessage;
      session.updatedAt = Date.now();
      saveSession(session);
    }
  }
};

// Clear all sessions
export const clearSessions = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};
