export interface Message {
  id: string;
  role: 'user' | 'system';
  content: string;
  image?: string;
  timestamp: number;
  diseaseInfo?: DiseaseInfo;
  weatherInfo?: WeatherInfo;
  isLocationRequest?: boolean;
}

export interface DiseaseInfo {
  disease_name: string;
  details: string;
  treatment: string;
  medications: string[];
}

export interface DiseaseResponse {
  disease_name: string;
  details: string;
  treatment: string;
  medications: string[];
}

export interface MessageResponse {
  message: string;
}

export type DiseaseOrTextResponse = DiseaseResponse | MessageResponse;

export interface WeatherInfo {
  location: string;
  temperature: number;
  humidity: number;
  conditions: string;
  suitable_for_treatment: boolean;
  recommendation: string;
}

export interface ChatSession {
  id: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}
