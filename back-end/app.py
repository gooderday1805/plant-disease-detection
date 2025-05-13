from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Cho phép cross-origin requests


@app.route('/', methods=['GET'])
def welcome():
    return jsonify({"status": "welcome plant disease detection"})


@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "ok"})


@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Xử lý dữ liệu đầu vào
        if request.content_type and request.content_type.startswith('multipart/form-data'):
            # Xử lý khi gửi hình ảnh
            if 'image' not in request.files:
                return jsonify({'error': 'No image provided'}), 400

            file = request.files['image']
            # Xử lý file, phân tích bệnh từ hình ảnh
            # ...

            # Giả lập kết quả
            result = {"disease_name": "Bệnh đốm lá (từ hình ảnh)"}
        else:
            # Xử lý khi gửi văn bản
            data = request.json
            if not data or 'text' not in data:
                return jsonify({'error': 'No text provided'}), 400

            # Phân tích bệnh từ văn bản
            # ...

            # Giả lập kết quả
            result = {"disease_name": f"Bệnh rỉ sắt (từ mô tả: {data['text'][:30]}...)"}

        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=5000)