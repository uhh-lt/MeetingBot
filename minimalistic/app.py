#!/usr/bin/env python
from __future__ import unicode_literals, print_function
from flask import Flask, render_template
from flask_socketio import SocketIO, emit
import scipy.io.wavfile as wavefile
import base64
import io

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


@socketio.on('recording_started', namespace='/test')
def recording_started():
    print("recording started!")


@socketio.on('data_available', namespace='/test')
def data_available(message):
    global counter
    print("new data is available!")
    samplerate, data = readmessage(message, write_bytes=True, write_numpy=True, write_counter=counter)
    print(samplerate)
    print(data)
    counter += 1


@socketio.on('recording_stopped', namespace='/test')
def recording_stopped(message):
    print(f"recording stopped!")
    samplerate, data = readmessage(message, write_bytes=True, write_numpy=True, write_counter='FINAL')
    # now work with data ...
    print(samplerate)
    print(data)


def readmessage(message, write_bytes = False, write_numpy = False, write_counter = 0):
    # decode base64 to bytes
    bytedata = base64.b64decode(message['base64'])

    # load bytes into a buffer
    bytebuffer = io.BytesIO(bytedata)

    # read the buffered .wav file with scipy wavefile to get the samplerate & numpy data
    samplerate, data = wavefile.read(bytebuffer)

    # optionally, write bytedata as a .wav file
    if write_bytes:
        with open(f"debugrawBYTES{write_counter}.wav", "wb") as file:
            file.write(bytedata)

    # optionally, write numpy array as a .wav file
    if write_numpy:
        wavefile.write(f"debugrawNUMPY{write_counter}.wav", samplerate, data)

    return samplerate, data


if __name__ == '__main__':
    socketio.run(app, debug=True)
