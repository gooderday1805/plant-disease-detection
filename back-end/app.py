from flask import Flask, request, jsonify
import os
import sys

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from ai_model.predict import LeafDiseasePredictor

# Import dữ liệu bệnh từ data.py
from data import disease_data

app = Flask(__name__)

# Load ai_model
predictor = LeafDiseasePredictor(
    model_path='ai_model/model.pt',
    label_map_path='ai_model/label_map_vi.json',
    device='auto'
)

# Class mapping model trả về sang key data
class_to_key = {
    "Class_0": "bacterial_leaf_blight",
    "Class_1": "brown_spot",
    "Class_2": "healthy",
    "Class_3": "leaf_blast",
    "Class_4": "leaf_scald",
    "Class_5": "narrow_brown_spot",
}

@app.route("/", methods=["GET"])
def hello():
    return jsonify({"message": "Hello, World!"})

@app.route("/api/predict", methods=["POST"])
def predict_disease():
    if "image" in request.files:
        image_file = request.files["image"]
        image_path = f"/tmp/{image_file.filename}"
        image_file.save(image_path)

        disease_class = predictor.predict(image_path)
        print("Predicted class:", disease_class)

        disease_key = class_to_key.get(disease_class)
        if disease_key and disease_key in disease_data:
            disease_info = disease_data[disease_key]
        else:
            disease_info = {
                "disease_name": "Không xác định",
                "details": "",
                "treatment": "",
                "medications": []
            }
    elif request.json and "text" in request.json:
        # NOTE: Chưa code đoạn này
        text = request.json["text"].lower()
        if "yellow" in text or "vàng" in text:
            disease_info = {
                
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