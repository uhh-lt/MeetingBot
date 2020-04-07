#!/usr/bin/env python
# -*- coding: utf-8 -*-

__author__ = 'Benjamin Milde'

import flask
from flask import jsonify, request
from flask_cors import CORS

import spacy
import os

base_path = os.getcwd()

app = flask.Flask(__name__)
app.secret_key = 'asdf'
app._static_folder = base_path
app._static_files_root_folder_path = base_path

CORS(app)

port = 9000

nlp_de = spacy.load('de')
nlp_en = spacy.load('en')

@app.route('/de')
def hello_world_de():
    output = []
    for token in nlp_de("Tim ist toll. Er arbeitet bei der University of Hamburg."):
        output.append((token.text, token.pos_, token.lemma_, token.dep_, token.is_stop))

    return jsonify(output)


@app.route('/en')
def hello_world_en():
    output = []
    for token in nlp_de("Tim is great. He works for the language technology department of the university of hamburg."):
        output.append((token.text, token.pos_, token.lemma_, token.dep_, token.is_stop))

    return jsonify(output)


@app.route('/process', methods=["POST"])
def process():

    # Parse POST request
    if not request.is_json:
        print("Request is not a JSON object :(")
        return ""
    content = request.get_json()
    text = content['text']
    lang = content['lang']
    print(f"Got new request lang: {lang} text: {text}")

    # Choose the correct spacy model
    nlp = None
    if lang == 'de':
        nlp = nlp_de
    elif lang == 'en':
        nlp = nlp_en

    # analyze input with spacy model
    if nlp is not None:
        output = []
        for token in nlp(text):
            output.append((token.text, token.pos_, token.lemma_, token.dep_, token.is_stop))
    else:
        output = f"Language {lang} is not supported"

    return jsonify(output)

if __name__ == '__main__':
    print(' * Starting app with base path:',base_path)
    app.debug = True
    app.run(host='0.0.0.0', threaded=True, port=port)
