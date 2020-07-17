#!/usr/bin/env python
from __future__ import unicode_literals, print_function
from flask import Flask, render_template
from flask_socketio import SocketIO, emit
import base64
import os

# create output dir
# recorded audio files will be stored there
ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_DIR = os.path.join(ROOT_DIR, 'output')
if not os.path.exists(OUTPUT_DIR):
    os.mkdir(OUTPUT_DIR)

INPUT_DIR = os.path.join(ROOT_DIR, 'input')

# read sentences
sentences = ""
with open(INPUT_DIR + '/sentences.txt', 'r') as input_file:
    seen = set()  # set for fast O(1) amortized lookup
    for line in input_file:
        sentences += line.strip() + "###"

# Set this variable to "threading", "eventlet" or "gevent" to test the
# different async modes, or leave it set to None for the application to choose
# the best option based on installed packages.
async_mode = None
app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app, async_mode=async_mode, sentences=sentences)


@app.route('/')
def index():
    return render_template('index.html',
                           sentences=sentences)


@socketio.on('connect', namespace='/test')
def connect():
    print("new connection")


@socketio.on('recording_started', namespace='/test')
def recording_started():
    print("recording started!")


@socketio.on('recording_stopped', namespace='/test')
def recording_stopped(message):
    print(f"recording stopped!")
    # write .wav file to disk
    bytedata = base64.b64decode(message['base64'])
    with open(OUTPUT_DIR + f"/{message['username']}-{message['sentencenumber']}.wav", "wb") as file:
        file.write(bytedata)


if __name__ == '__main__':
    socketio.run(app, debug=True)
