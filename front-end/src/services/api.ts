import { DiseaseOrTextResponse } from '@/types';

const API_URL = '/api/predict';
const WEATHER_API_URL = '/api/weather';

interface PredictDiseaseParams {
  text?: string;
  image?: File;
}

// Hàm gọi API để dự đoán bệnh
export const predictDisease = async ({ text, image }: PredictDiseaseParams): Promise<DiseaseOrTextResponse> => {
  try {
    const formData = new FormData();

    if (image) {
      formData.append('image', image);
    }

    const response = await fetch(API_URL, {
      method: 'POST',
      body: image ? formData : JSON.stringify({ text }),
      headers: image ? undefined : {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Lỗi khi gọi API');
    }

    return await response.json();
  } catch (error) {
    console.error('Lỗi khi dự đoán bệnh:', error);
    throw error;
  }
};

export const getWeatherData = async (location: string) => {
  try {
    const response = await fetch(`${WEATHER_API_URL}?location=${encodeURIComponent(location)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Lỗi khi lấy dữ liệu thời tiết từ server');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu thời tiết:', error);
    throw error;
  }
};
