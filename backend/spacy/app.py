from flask import Flask
from flask import jsonify, request
from flask_cors import CORS
import numpy as np
import networkx as nx
from sklearn.metrics.pairwise import cosine_similarity
import spacy
import argparse
import time

app = Flask(__name__)
CORS(app)

port = 9999

# python -m spacy download en_core_web_lg
# python -m spacy download de_core_news_md
nlp_en = None
nlp_de = None
args = None

@app.route('/health')
def health():
    if args.langs == 'en' or args.langs == 'both':
        summary = generate_summary("Tim is a good boy. Everyone likes tim. Tim is a bad boy. Tim is a great boy.", 1, "en")
    elif args.langs == 'de' or args.langs == 'both':
        summary = generate_summary("Tim ist ein guter Junge. Jeder mag Tim. Tim ist ein schlechter Junge. Tim ist ein großartiger Junge", 1, "de")
    else:
        summary = 'language not supported'

    if args.langs == 'de' or args.langs == 'both':
        output = []
        for token in nlp_de("Tim ist toll. Er arbeitet bei der University of Hamburg."):
            output.append((token.text, token.pos_, token.lemma_, token.dep_, token.is_stop))

        pos = output
    elif args.langs == 'en' or args.langs == 'both':
        output = []
        for token in nlp_de("Tim is great. He works for the language technology department of the university of hamburg."):
            output.append((token.text, token.pos_, token.lemma_, token.dep_, token.is_stop))

        pos = output
    else:
        pos = "language not supported"

    return jsonify({
        "summary": summary,
        "pos": pos
    })


@app.route('/')
def hello_world():
    if args.langs == 'en' or args.langs == 'both':
        return jsonify({
            "summary": generate_summary("Tim is a good boy. Everyone likes tim. Tim is a bad boy. Tim is a great boy.", 1, "en")
        })
    elif args.langs == 'de' or args.langs == 'both':
        return jsonify({
            "summary": generate_summary("Tim ist ein guter Junge. Jeder mag Tim. Tim ist ein schlechter Junge. Tim ist ein großartiger Junge", 1, "de")
        })
    else:
        return 'language not supported'


@app.route('/de')
def hello_world_de():
    if args.langs == 'de' or args.langs == 'both':
        output = []
        for token in nlp_de("Tim ist toll. Er arbeitet bei der University of Hamburg."):
            output.append((token.text, token.pos_, token.lemma_, token.dep_, token.is_stop))

        return jsonify(output)
    else:
        return "language not supported"


@app.route('/en')
def hello_world_en():
    if args.langs == 'en' or args.langs == 'both':
        output = []
        for token in nlp_de("Tim is great. He works for the language technology department of the university of hamburg."):
            output.append((token.text, token.pos_, token.lemma_, token.dep_, token.is_stop))

        return jsonify(output)
    else:
        return "language not supported"


@app.route('/summarize', methods=['POST'])
def summarize():
    if not request.is_json:
        print("Request is not a JSON object :(")
        return ""
    content = request.get_json()
    print('Got a request:')
    print(content)
    return jsonify({
        "summary": generate_summary(content['text'], content['length'], content['lang'])
    })

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

# function to generate a summary from text with sentence length n
def generate_summary(text, n, lang):
    if lang == 'en' and (args.langs == 'en' or args.langs == 'both'):
        nlp = nlp_en
    elif lang == 'de' and (args.langs == 'de' or args.langs == 'both'):
        nlp = nlp_de
    else:
        return ""

    doc = nlp(text)

    # filter stopwords in sentence
    # then map words of sentence to vectors
    # then calculate mean of the vectors to get the sentence embedding
    # for all sentences
    sentence_vectors = [np.mean(np.array(list(map(lambda t: t.vector, list(filter(lambda t: not t.is_stop, sentence))))), axis=0) for sentence in doc.sents]

    # create similarity matrix
    sim_mat = np.zeros([len(sentence_vectors), len(sentence_vectors)])

    # init similarity matrix with cosine similarities of all sentences
    for i in range(len(sentence_vectors)):
        for j in range(len(sentence_vectors)):
            if i != j:
                sim_mat[i][j] = cosine_similarity(sentence_vectors[i].reshape(1, sentence_vectors[i].shape[0]), sentence_vectors[j].reshape(1, sentence_vectors[i].shape[0]))[0, 0]

    # use pagerank on the simmilarity matrix
    nx_graph = nx.from_numpy_array(sim_mat)
    scores = nx.pagerank(nx_graph)

    # map sentences to scores
    ranked_sentences = sorted(((scores[i], s) for i, s in enumerate(doc.sents)), reverse=True)

    # Generate Summary
    summary = ""
    for i in range(n):
        summary += str(ranked_sentences[i][1]) + "\n"
        print("Sentence:"+str(ranked_sentences[i][1])+" Score:"+str(ranked_sentences[i][0]))

    # return summary
    return summary.strip()


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument("-l", dest="langs", default='de', type=str, choices=['de', 'en', 'both'])
    parser.add_argument('--test-server', dest='test_server', help='Start the flask intern web server.', action='store_true', default=False)
    args = parser.parse_args()
    reactor_args = {}

    if not args.langs:
        parser.print_help()
        exit()

    start = time.time()
    print("Loading models...")
    if args.langs == 'de':
        nlp_de = spacy.load("de_core_news_md")
    elif args.langs == 'en':
        nlp_en = spacy.load("en_core_web_lg")
    elif args.langs == 'both':
        nlp_de = spacy.load("de_core_news_md")
        nlp_en = spacy.load("en_core_web_lg")
    end = time.time()
    print(end-start, 'seconds needed to load.')

    def run_twisted_wsgi():
        from twisted.internet import reactor
        from twisted.web.server import Site
        from twisted.web.wsgi import WSGIResource

        resource = WSGIResource(reactor, reactor.getThreadPool(), app)
        site = Site(resource)
        reactor.listenTCP(port, site)
        reactor.run(**reactor_args)

    print('Starting spacy service...')
    if args.test_server:
        print('Running as testing server.')
        app.debug = True
        app.run(host='0.0.0.0', threaded=True, port=port)
    else:
        print('Running as deployment server.')
        run_twisted_wsgi()









