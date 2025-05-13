
const API_URL = '/predict';
const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/weather';

// Mock API key - in a real app this should be stored securely
const WEATHER_API_KEY = 'mock_api_key';

export const predictDisease = async (data: { text?: string; image?: File }) => {
  try {
    let requestBody;
    let headers = {};
    
    if (data.image) {
      // Image upload - use multipart/form-data
      requestBody = new FormData();
      requestBody.append('image', data.image);
    } else if (data.text) {
      // Text only - use JSON
      requestBody = JSON.stringify({ text: data.text });
      headers = {
        'Content-Type': 'application/json'
      };
    } else {
      throw new Error('Either text or image must be provided');
    }
    
    // For development and demo purposes, mock API response
    // In a real app, replace this with actual fetch API call
    return mockApiResponse(data);
    
    // Actual API call would look like this:
    /*
    const response = await fetch(API_URL, {
      method: 'POST',
      headers,
      body: requestBody,
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
    */
  } catch (error) {
    console.error('API error:', error);
    throw error;
  }
};

// Get weather data based on location
export const getWeatherData = async (location: string) => {
  try {
    // In a real app, use the actual API
    // For development purposes, we'll mock it
    return mockWeatherData(location);
    
    // Actual weather API call would look like:
    /*
    const response = await fetch(`${WEATHER_API_URL}?q=${encodeURIComponent(location)}&appid=${WEATHER_API_KEY}&units=metric`);
    
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }
    
    return await response.json();
    */
  } catch (error) {
    console.error('Weather API error:', error);
    throw error;
  }
};

// Mock API response for development and demo
const mockApiResponse = async (data: { text?: string; image?: File }) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  let diseaseInfo = {
    disease_name: "Unknown disease",
    details: "",
    treatment: "",
    medications: []
  };
  
  // Mock different responses based on input
  if (data.text) {
    const text = data.text.toLowerCase();
    
    if (text.includes("vàng") || text.includes("yellow")) {
      diseaseInfo = {
        disease_name: "Bệnh vàng lá (Chlorosis)",
        details: "Bệnh vàng lá thường do thiếu các chất dinh dưỡng như sắt, mangan hoặc kẽm. Lá cây sẽ chuyển sang màu vàng nhưng gân lá vẫn giữ màu xanh.",
        treatment: "Bón phân cân đối, phun dung dịch phân bón lá chứa vi lượng, cải thiện độ pH của đất.",
        medications: ["Phân bón lá chứa sắt", "Phân vi lượng tổng hợp", "Chế phẩm điều chỉnh pH đất"]
      };
    } else if (text.includes("đốm") || text.includes("spot")) {
      diseaseInfo = {
        disease_name: "Bệnh đốm lá (Leaf spot)",
        details: "Bệnh đốm lá thường do nấm hoặc vi khuẩn gây ra. Biểu hiện là các đốm màu nâu hoặc đen trên bề mặt lá, có thể lan rộng và làm lá rụng sớm.",
        treatment: "Loại bỏ lá bị bệnh, tăng cường thông gió, tưới nước vào gốc thay vì lên lá, sử dụng thuốc trừ nấm.",
        medications: ["Thuốc trừ nấm có chứa đồng", "Thuốc trừ nấm chứa Mancozeb", "Chế phẩm sinh học Trichoderma"]
      };
    } else if (text.includes("héo") || text.includes("wilt")) {
      diseaseInfo = {
        disease_name: "Bệnh héo rũ (Fusarium wilt)",
        details: "Bệnh héo rũ do nấm Fusarium gây ra, tấn công hệ thống mạch dẫn của cây. Cây héo từng phần hoặc toàn bộ, thậm chí khi đất đủ ẩm.",
        treatment: "Nhổ bỏ cây bị bệnh, xử lý đất trước khi trồng lại, chọn giống kháng bệnh, luân canh với cây trồng khác họ.",
        medications: ["Thuốc trừ nấm gốc Carbendazim", "Chế phẩm sinh học Trichoderma", "Thuốc trừ nấm gốc Propiconazole"]
      };
    } else if (text.includes("mốc") || text.includes("mold")) {
      diseaseInfo = {
        disease_name: "Bệnh mốc xám (Gray mold)",
        details: "Bệnh mốc xám do nấm Botrytis gây ra, thường phát triển trong điều kiện ẩm ướt. Biểu hiện là lớp mốc xám trên lá, hoa và quả.",
        treatment: "Tăng thông gió, giảm độ ẩm, loại bỏ bộ phận bị nhiễm bệnh, phun thuốc trừ nấm phòng ngừa.",
        medications: ["Thuốc trừ nấm chứa Iprodione", "Thuốc trừ nấm sinh học gốc Bacillus", "Thuốc trừ nấm chứa Thiophanate-methyl"]
      };
    } else if (text.includes("rỉ") || text.includes("rust")) {
      diseaseInfo = {
        disease_name: "Bệnh rỉ sắt (Rust)",
        details: "Bệnh rỉ sắt do nấm gây ra với đặc trưng là các đốm màu nâu đỏ hoặc cam trên lá. Bào tử của nấm có thể lan truyền qua không khí.",
        treatment: "Loại bỏ lá bị bệnh, tăng cường thông gió, tránh tưới nước lên lá, phun thuốc trừ nấm chuyên dụng.",
        medications: ["Thuốc trừ nấm chứa Tebuconazole", "Thuốc trừ nấm chứa Azoxystrobin", "Thuốc trừ nấm gốc lưu huỳnh"]
      };
    } else {
      diseaseInfo = {
        disease_name: "Không thể xác định bệnh từ mô tả",
        details: "Vui lòng cung cấp thêm thông tin hoặc hình ảnh để được chẩn đoán chính xác hơn.",
        treatment: "Chưa có khuyến nghị cụ thể.",
        medications: ["Chưa có khuyến nghị thuốc cụ thể"]
      };
    }
  } else if (data.image) {
    // Randomly choose a disease for demonstration purposes
    const diseases = [
      {
        disease_name: "Bệnh đốm lá (Leaf spot)",
        details: "Bệnh đốm lá thường do nấm hoặc vi khuẩn gây ra. Biểu hiện là các đốm màu nâu hoặc đen trên bề mặt lá, có thể lan rộng và làm lá rụng sớm.",
        treatment: "Loại bỏ lá bị bệnh, tăng cường thông gió, tưới nước vào gốc thay vì lên lá, sử dụng thuốc trừ nấm.",
        medications: ["Thuốc trừ nấm có chứa đồng", "Thuốc trừ nấm chứa Mancozeb", "Chế phẩm sinh học Trichoderma"]
      },
      {
        disease_name: "Bệnh vàng lá (Chlorosis)",
        details: "Bệnh vàng lá thường do thiếu các chất dinh dưỡng như sắt, mangan hoặc kẽm. Lá cây sẽ chuyển sang màu vàng nhưng gân lá vẫn giữ màu xanh.",
        treatment: "Bón phân cân đối, phun dung dịch phân bón lá chứa vi lượng, cải thiện độ pH của đất.",
        medications: ["Phân bón lá chứa sắt", "Phân vi lượng tổng hợp", "Chế phẩm điều chỉnh pH đất"]
      },
      {
        disease_name: "Bệnh héo rũ (Fusarium wilt)",
        details: "Bệnh héo rũ do nấm Fusarium gây ra, tấn công hệ thống mạch dẫn của cây. Cây héo từng phần hoặc toàn bộ, thậm chí khi đất đủ ẩm.",
        treatment: "Nhổ bỏ cây bị bệnh, xử lý đất trước khi trồng lại, chọn giống kháng bệnh, luân canh với cây trồng khác họ.",
        medications: ["Thuốc trừ nấm gốc Carbendazim", "Chế phẩm sinh học Trichoderma", "Thuốc trừ nấm gốc Propiconazole"]
      },
      {
        disease_name: "Bệnh mốc xám (Gray mold)",
        details: "Bệnh mốc xám do nấm Botrytis gây ra, thường phát triển trong điều kiện ẩm ướt. Biểu hiện là lớp mốc xám trên lá, hoa và quả.",
        treatment: "Tăng thông gió, giảm độ ẩm, loại bỏ bộ phận bị nhiễm bệnh, phun thuốc trừ nấm phòng ngừa.",
        medications: ["Thuốc trừ nấm chứa Iprodione", "Thuốc trừ nấm sinh học gốc Bacillus", "Thuốc trừ nấm chứa Thiophanate-methyl"]
      },
      {
        disease_name: "Bệnh rỉ sắt (Rust)",
        details: "Bệnh rỉ sắt do nấm gây ra với đặc trưng là các đốm màu nâu đỏ hoặc cam trên lá. Bào tử của nấm có thể lan truyền qua không khí.",
        treatment: "Loại bỏ lá bị bệnh, tăng cường thông gió, tránh tưới nước lên lá, phun thuốc trừ nấm chuyên dụng.",
        medications: ["Thuốc trừ nấm chứa Tebuconazole", "Thuốc trừ nấm chứa Azoxystrobin", "Thuốc trừ nấm gốc lưu huỳnh"]
      }
    ];
    
    diseaseInfo = diseases[Math.floor(Math.random() * diseases.length)];
  }
  
  return diseaseInfo;
};

// Mock weather data
const mockWeatherData = async (location: string) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Return mock data based on location
  const normalizedLocation = location.toLowerCase();
  
  if (normalizedLocation.includes("hanoi") || normalizedLocation.includes("hà nội")) {
    return {
      location: "Hà Nội",
      temperature: 32,
      humidity: 80,
      conditions: "Mưa nhẹ",
      suitable_for_treatment: true,
      recommendation: "Thời tiết có mưa nhẹ, thích hợp cho các biện pháp xử lý bệnh. Lưu ý đợi lúc tạnh mưa để phun thuốc."
    };
  } else if (normalizedLocation.includes("ho chi minh") || normalizedLocation.includes("hồ chí minh") || normalizedLocation.includes("saigon") || normalizedLocation.includes("sài gòn")) {
    return {
      location: "Hồ Chí Minh",
      temperature: 34,
      humidity: 75,
      conditions: "Nắng, có mây",
      suitable_for_treatment: true,
      recommendation: "Thời tiết nắng nhẹ, thích hợp cho việc phun thuốc vào buổi sáng sớm hoặc chiều muộn."
    };
  } else if (normalizedLocation.includes("da nang") || normalizedLocation.includes("đà nẵng")) {
    return {
      location: "Đà Nẵng",
      temperature: 30,
      humidity: 85,
      conditions: "Mưa dông",
      suitable_for_treatment: false,
      recommendation: "Thời tiết hiện tại có mưa dông, không thích hợp cho việc phun thuốc. Nên đợi thời tiết ổn định hơn."
    };
  } else {
    return {
      location: location,
      temperature: 29,
      humidity: 78,
      conditions: "Nhiều mây",
      suitable_for_treatment: true,
      recommendation: "Thời tiết ổn định, có thể tiến hành các biện pháp xử lý bệnh."
    };
  }
};
