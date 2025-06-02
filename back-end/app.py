from datetime import datetime
from flask import Flask, request, jsonify

# Import ai_model
import os
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from ai_model.predict import LeafDiseasePredictor

# Create Flask app
app = Flask(__name__)

# Load ai_model
predictor = LeafDiseasePredictor(
    model_path='ai_model/model.pt',
    label_map_path='ai_model/label_map_vi.json',
    device='auto'
)

# Mock Test say hello api
@app.route("/", methods=["GET"])
def hello():
    return jsonify({"message": "Hello, World!"})

# API về bệnh lá
@app.route("/api/predict", methods=["POST"])
def predict_disease():
    if "image" in request.files:
        image_file = request.files["image"]
        image_path = f"/tmp/{image_file.filename}"
        image_file.save(image_path)

        # Dự đoán tên bệnh
        disease_name = predictor.predict(image_path)

        disease_info = {
            "disease_name": disease_name,
            "details": "",
            "treatment": "",
            "medications": []
        }
        
    elif request.json and "text" in request.json:
        # NOTE: Chưa code đoạn nàynày
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

@app.route("/api/weather", methods=["GET"])
def weather_info():
    location = request.args.get('location', 'Không có vị trí')

    return jsonify({"message": f"hello from {location}"})

if __name__ == "__main__":
    app.run(debug=True)