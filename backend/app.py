from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/', methods=['GET'])
def welcome():
    return jsonify({"status": "welcome plant disease detection"})

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "ok"})


if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=5000)
