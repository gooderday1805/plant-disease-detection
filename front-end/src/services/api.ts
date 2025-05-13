interface PredictDiseaseParams {
  text?: string;
  image?: File;
}

interface DiseaseResponse {
  disease_name: string;
  details: string;
  treatment: string;
  medications: string[];
}

// Hàm gọi API để dự đoán bệnh
export const predictDisease = async ({ text, image }: PredictDiseaseParams): Promise<DiseaseResponse> => {
  try {
    const formData = new FormData();

    if (text) {
      formData.append('text', text);
    }

    if (image) {
      formData.append('image', image);
    }

    const response = await fetch('/api/predict', {
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

interface WeatherResponse {
  city: string;
  temperature: number;
  condition: string;
  time: string;
}

// Hàm lấy dữ liệu thời tiết
export const getWeatherData = async (location: string) => {
  try {
    // Gọi API với location
    const response = await fetch(`/api/weather?location=${encodeURIComponent(location)}`);

    if (!response.ok) {
      throw new Error('Lỗi khi lấy dữ liệu thời tiết');
    }

    return await response.json();
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu thời tiết:', error);
    throw error;
  }
};