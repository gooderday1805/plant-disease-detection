import time
import requests
import os
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")

def call_gemini(prompt: str, retries: int = 3, delay: int = 2) -> str:
    if not API_KEY:
        return "API key không tồn tại. Vui lòng kiểm tra file .env."

    api_url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
    headers = {"Content-Type": "application/json"}
    params = {"key": API_KEY}
    payload = {
        "contents": [
            {
                "parts": [
                    {
                        "text": prompt
                    }
                ]
            }
        ]
    }

    for attempt in range(retries):
        try:
            response = requests.post(api_url, headers=headers, params=params, json=payload)
            response.raise_for_status()
            result = response.json()
            return result["candidates"][0]["content"]["parts"][0]["text"]
        except requests.exceptions.RequestException as e:
            if response.status_code >= 500:
                print(f"Lỗi server {response.status_code}, thử lại ({attempt+1}/{retries})...")
                time.sleep(delay)
                continue
            return f"Lỗi khi gọi API: {str(e)}"
        except Exception:
            return "Không thể phân tích phản hồi từ mô hình."
    
    return "Dịch vụ quá tải. Vui lòng thử lại sau."

if __name__ == "__main__":
    reply = call_gemini("Explain how AI works in a few words")
    print("Phản hồi từ Gemini:", reply)
