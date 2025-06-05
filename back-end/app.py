from flask import Flask, request, jsonify
import os
import sys
import threading

from data import disease_data

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from ai_model.predict import LeafDiseasePredictor
from rag_llm.retriever import retrieve
from rag_llm.llm_response import call_gemini

app = Flask(__name__)

# Load mô hình AI
predictor = LeafDiseasePredictor(
    model_path='ai_model/model.pt',
    label_map_path='ai_model/label_map_vi.json',
    device='auto'
)

class_to_key = {
    "Class_0": "bacterial_leaf_blight",
    "Class_1": "brown_spot",
    "Class_2": "healthy",
    "Class_3": "leaf_blast",
    "Class_4": "leaf_scald",
    "Class_5": "narrow_brown_spot",
}

# Biến toàn cục
last_disease_key = None
last_disease_data = None
retrieve_done = True
last_location = None
location_received = False

def async_retrieve(query):
    global last_disease_data, retrieve_done
    try:
        retrieve_done = False
        result = retrieve(query)
        last_disease_data = result
        print("Retrieve result saved.")
    except Exception as e:
        print("Retrieve failed:", e)
    finally:
        retrieve_done = True

@app.route("/", methods=["GET"])
def hello():
    return jsonify({"message": "Hello, World!"})

@app.route("/api/predict", methods=["POST"])
def predict_disease():
    global last_disease_key

    if "image" in request.files:
        image_file = request.files["image"]
        image_path = f"/tmp/{image_file.filename}"
        image_file.save(image_path)

        disease_class = predictor.predict(image_path)
        print("Predicted class:", disease_class)

        disease_key = class_to_key.get(disease_class)
        last_disease_key = disease_key

        if disease_key and disease_key in disease_data:
            disease_info = disease_data[disease_key]
        else:
            disease_info = {
                "disease_name": "Không xác định",
                "details": "",
                "treatment": "",
                "medications": []
            }

        if disease_key:
            query = f"thông tin liên quan đến bệnh {disease_key}"
            if location_received and last_location:
                query += f" ở khu vực {last_location}"
            threading.Thread(target=async_retrieve, args=(query,), daemon=True).start()

        return jsonify(disease_info)

    elif request.json and "text" in request.json:
        text = request.json["text"].strip()

        if not last_disease_key:
            return jsonify({
                "message": "Vui lòng cung cấp ảnh lá cây lúa. \nTôi sẽ dựa trên hình ảnh để phân tích và đưa ra dự đoán về bệnh."
            })

        if not retrieve_done:
            return jsonify({
                "message": "Vui lòng đợi một chút, hệ thống đang xử lý dữ liệu. Bạn có thể thử lại sau."
            })

        # Prompt cho Gemini
        prompt = f"""
        Dưới đây là thông tin về bệnh: {last_disease_key}
        {last_disease_data}

        Câu hỏi từ người dùng: {text}
        """

        if location_received and last_location:
            prompt += f"\n\nLưu ý: Người dùng đang ở khu vực {last_location}. Hãy đưa ra câu trả lời phù hợp với điều kiện khí hậu và địa phương tại đây."

        prompt += "\nVui lòng trả lời như một chuyên gia nông nghiệp tại Việt Nam."

        try:
            response = call_gemini(prompt)
            return jsonify({"message": response})
        except Exception as e:
            print("Lỗi gọi Gemini:", e)
            return jsonify({"message": "Lỗi hệ thống khi gọi LLM. Vui lòng thử lại."})
        
    else:
        return jsonify({"error": "Vui lòng cung cấp ảnh hoặc văn bản"}), 400

@app.route("/api/weather", methods=["GET"])
def weather_info():
    global last_location, location_received

    location = request.args.get('location', '').strip()
    if location:
        last_location = location
        location_received = True
        return jsonify({"message": f"Đã ghi nhận địa phương: {location}"})
    else:
        return jsonify({"message": "Không nhận được thông tin địa phương."})

if __name__ == "__main__":
    app.run(debug=True)
