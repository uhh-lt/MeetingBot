import numpy as np
import networkx as nx
from sklearn.metrics.pairwise import cosine_similarity
import spacy

# python -m spacy download en_core_web_lg
# python -m spacy download de_core_news_md
nlp_en = spacy.load("en_core_web_lg")
nlp_de = spacy.load("de_core_news_md")

# function to generate a summary from text with sentence length n
def generate_summary(text, n, lang):
    if lang == 'en':
        nlp = nlp_en
    elif lang == 'de':
        nlp = nlp_de
    else:
        return 0

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
