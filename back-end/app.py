from datetime import datetime

from flask import Flask, request, jsonify

app = Flask(__name__)

# Mock Test say hello api
@app.route("/", methods=["GET"])
def hello():
    return jsonify({"message": "Hello, World!"})

# Endpoint 1: Mock API dự đoán bệnh
@app.route("/api/predict", methods=["POST"])
def predict_disease():
    # Info request 
    # Image -> model AI -> Disease info
    # Text -> llm -> result
    print("Info request: text / file ")
    # print(request.json["text"])
    if "image" in request.files:
        # Logic xử lý đầu vào là hình ảnh
        disease_info = {
            "disease_name": "Bệnh đốm lá (Leaf spot)",
            "details": "Bệnh đốm lá thường do nấm hoặc vi khuẩn gây ra. Biểu hiện là các đốm màu nâu hoặc đen...",
            "treatment": "Loại bỏ lá bị bệnh, tăng cường thông gió, tưới nước vào gốc thay vì lên lá...",
            "medications": ["Thuốc trừ nấm có chứa đồng", "Mancozeb", "Chế phẩm Trichoderma"]
        }
    elif request.json and "text" in request.json:
        # Logic xử lý đầu vào là văn bản
        text = request.json["text"].lower()
        if "yellow" in text or "vàng" in text:
            disease_info = {
                "disease_name": "Bệnh vàng lá (Chlorosis)",
                "details": "Bệnh vàng lá thường do thiếu các chất dinh dưỡng như sắt, mangan hoặc kẽm...",
                "treatment": "Bón phân cân đối, phun dung dịch phân bón lá chứa vi lượng...",
                "medications": ["Phân bón lá chứa sắt", "Phân vi lượng tổng hợp", "Chế phẩm điều chỉnh pH đất"]
            }
        elif "spot" in text or "đốm" in text:
            disease_info = {
                "disease_name": "Bệnh đốm lá (Leaf spot)",
                "details": "Bệnh đốm lá thường do nấm hoặc vi khuẩn gây ra...",
                "treatment": "Loại bỏ lá bị bệnh, tăng cường thông gió...",
                "medications": ["Thuốc trừ nấm có chứa đồng", "Mancozeb", "Trichoderma"]
            }
        else:
            disease_info = {
                "disease_name": "Không xác định",
                "details": "Không thể xác định được bệnh dựa trên thông tin cung cấp.",
                "treatment": "Hãy cung cấp thêm thông tin để phân tích chính xác hơn.",
                "medications": []
            }
    else:
        return jsonify({"error": "Vui lòng cung cấp text hoặc image để phân tích"}), 400

    return jsonify(disease_info)


# Endpoint 2: Mock API thời tiết
# @app.route("/api/weather", methods=["GET"])
# def weather_info():
#     # Lấy location từ query params
#     location = request.args.get('location', 'Không có vị trí')

#     # Dữ liệu mock cho thông tin thời tiết
#     weather_mock_data = {
#         "city": location,
#         "temperature": 32,
#         "condition": f"Thời tiết tại {location}",
#         "time": datetime.now().isoformat()
#     }
#     return jsonify(weather_mock_data)
@app.route("/api/weather", methods=["GET"])
def weather_info():
    location = request.args.get('location', 'Không có vị trí')

    return jsonify({"message": f"hello from {location}"})

if __name__ == "__main__":
    app.run(debug=True)