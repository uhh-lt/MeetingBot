from flask import Flask
from flask import jsonify, request
from flask_cors import CORS
import textrank as textrank

app = Flask(__name__)
CORS(app)


@app.route('/')
def hello_world():
    return jsonify({
        "summary": textrank.generate_summary("Tim is a good boy. Everyone likes tim. Tim is a bad boy. Tim is a great boy.", 1, "en")
    })


@app.route('/summarize', methods=['POST'])
def summarize():
    if not request.is_json:
        print("Request is not a JSON object :(")
        return ""
    content = request.get_json()
    print(content)
    return jsonify({
        "summary": textrank.generate_summary(content['text'], content['length'], content['lang'])
    })


def main():
    # start flask app
    app.run(host='0.0.0.0')


if __name__ == '__main__':
    main()

