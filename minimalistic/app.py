#!/usr/bin/env python
from flask import Flask, render_template
from flask_socketio import SocketIO, emit

# Set this variable to "threading", "eventlet" or "gevent" to test the
# different async modes, or leave it set to None for the application to choose
# the best option based on installed packages.
async_mode = None

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app, async_mode=async_mode)


@app.route('/')
def index():
    return render_template('index.html', async_mode=socketio.async_mode)


@socketio.on('connect', namespace='/test')
def test_connect():
    print("new connection")


@socketio.on('data_available', namespace='/test')
def data_available(message):
    print("new data is available!")
    print(message["data"]) # i am not sure if this is raw data or just a chunk of the webm


@socketio.on('recording_stopped', namespace='/test')
def recording_stopped(message):
    print(f"recording stopped! codec:{message['codec']}")
    # write recording to file
    f = open(f'./file.{message["mime"]}', 'wb') # mime type should be either webm (chrome) or ogg (firefox)
    f.write(message["blob"])
    f.close()


@socketio.on('recording_started', namespace='/test')
def recording_started():
    print("recording started!")


if __name__ == '__main__':
    socketio.run(app, debug=True)
