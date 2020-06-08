#!/usr/bin/env python
from __future__ import unicode_literals, print_function
from flask import Flask, render_template
from flask_socketio import SocketIO, emit
import ffmpeg
import sys
import numpy as np
import scipy.io.wavfile as wavefile
import base64
import io

# you need to install ffmpeg with sudo apt install ffmpeg

# Set this variable to "threading", "eventlet" or "gevent" to test the
# different async modes, or leave it set to None for the application to choose
# the best option based on installed packages.
async_mode = None

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app, async_mode=async_mode)

counter = 0

@app.route('/')
def index():
    return render_template('index.html', async_mode=socketio.async_mode)


@socketio.on('connect', namespace='/test')
def connect():
    print("new connection")


@socketio.on('data_available', namespace='/test')
def data_available(message):
    global counter
    print("new data is available!")
    # rawaudio = np.frombuffer(message["data"], dtype=np.int16)
    # wavefile.write(f"chunk{counter}.wav", 16000, rawaudio)
    # counter += 1


@socketio.on('recording_stopped', namespace='/test')
def recording_stopped(message):
    print(f"recording stopped!")
    audiodata = message2numpy(message)

    # write raw audio as wav file
    # wavefile.write("debugraw.wav", 16000, audiodata[:round(len(audiodata)/2)])
    wavefile.write("debugraw.wav", 16000, audiodata)


    print("LOL")
    print("LOL")
    print("LOL")
    print("LOL")

    raw = message["dataURL"].split(",").pop()
    bytes = base64.b64decode(raw)
    print(bytes)
    with open("test.wav", "wb") as file:
        file.write(bytes)

    bytebuffer = io.BytesIO(bytes)
    samplerate, data = wavefile.read(bytebuffer)

    print(samplerate)
    print(data)

    # rawaudio = np.frombuffer(raw, dtype=np.int16)
    # wavefile.write("debugraw2.wav", 16000, rawaudio)
    #
    # print(audiodata)
    # print(rawaudio)


def decode_audio(in_filename):
    try:
        out, err = (ffmpeg
                    .input(in_filename)
                    .output('-', format='s16le', acodec='pcm_s16le', ac=1, ar='16k')
                    .overwrite_output()
                    .run(capture_stdout=True, capture_stderr=True)
                    )
    except ffmpeg.Error as e:
        print(e.stderr)
        sys.exit(1)
    return out


def message2numpy(message):
    # write message to file e.g. to file.webm
    f = open(f'./file.{message["mime"]}', 'wb') # mime type should be either webm (chrome) or ogg (firefox)
    f.write(message["data"])
    f.close()

    # read file and convert to byte string
    byteaudio = decode_audio(f'file.{message["mime"]}')
    print(byteaudio)

    # convert byte string to numpy array
    rawaudio = np.frombuffer(byteaudio, dtype=np.int16)

    return rawaudio


@socketio.on('recording_started', namespace='/test')
def recording_started():
    print("recording started!")


if __name__ == '__main__':
    socketio.run(app, debug=True)
