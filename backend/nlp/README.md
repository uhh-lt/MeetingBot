# NLP
This is a microservice for pos tagging and lemmatization with spacy.

## Installation

#### for development: 
- Install dependencies: `pip3 install -r requirements.txt`
- For german model support download the newest 'de' model with: `python3 -m spacy download de`
- For english model support download the newest 'en' model with: `python3 -m spacy download en`
- Run: `python3 app.py`

#### for production: 
- please see below how to build the docker container yourself or just pull the latest docker container with: `docker pull bigabig/mbot-nlp:latest`
- run the docker container: `docker run -p9000:9000 bigabig/mbot-nlp:latest`

## Usage
This microservice provides just one endpoint at http://localhost:9000/process.
POST a JSON request to this endpoint with following parameters:
- text: A string that you want to summarize
- lang: language of input string 'de' or 'en'

The service returns a list of (token, pos, lemma, dep) tuples as json.

Example request:
```
curl -d "text=auch wenn wir von dieser Zukunft noch etwas entfernt sind ist es heute schon sinnvoll über IT Ethik zu diskutieren" -X POST http://localhost:9000/process
```

Example response:
```
[
  [
    "auch",
    "ADV",
    "auch",
    "mo"
  ],
  [
    "wenn",
    "SCONJ",
    "wenn",
    "cp"
  ],
  [
    "wir",
    "PRON",
    "ich",
    "sb"
  ],
  [
    "von",
    "ADP",
    "von",
    "sbp"
  ],
  [
    "dieser",
    "DET",
    "dies",
    "nk"
  ],
  [
    "Zukunft",
    "NOUN",
    "Zukunft",
    "nk"
  ],
  [
    "noch",
    "ADV",
    "noch",
    "mo"
  ],
  [
    "etwas",
    "PRON",
    "etwas",
    "mo"
  ],
  [
    "entfernt",
    "ADJ",
    "entfernen",
    "pd"
  ],
  [
    "sind",
    "AUX",
    "sein",
    "oc"
  ],
  [
    "ist",
    "AUX",
    "sein",
    "ROOT"
  ],
  [
    "es",
    "PRON",
    "ich",
    "sb"
  ],
  [
    "heute",
    "ADV",
    "heute",
    "mo"
  ],
  [
    "schon",
    "ADV",
    "schon",
    "mo"
  ],
  [
    "sinnvoll",
    "ADJ",
    "sinnvoll",
    "mo"
  ],
  [
    "über",
    "ADP",
    "über",
    "mo"
  ],
  [
    "IT",
    "PROPN",
    "IT",
    "nk"
  ],
  [
    "Ethik",
    "NOUN",
    "Ethik",
    "oa"
  ],
  [
    "zu",
    "PART",
    "zu",
    "pm"
  ],
  [
    "diskutieren",
    "VERB",
    "diskutieren",
    "oc"
  ]
]
```

## Languages
This service supports:
- english (en)
- german (de)

## Building the docker container
- Build the container: `docker build -t bigabig/mbot-nlp:latest .`
- (Optional) Test if the container is working:
  - Run the container: `docker run -p9000:9000 bigabig/mbot-nlp:latest`
  - View example output: visit http://localhost:9000/
