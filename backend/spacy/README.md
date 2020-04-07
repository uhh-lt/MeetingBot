# Spacy
This is a microservice that combines the nlp microservice ([link](../nlp)) and the textrank microservice ([link](../textrank)) to increase performance & reduce space as they both share the spacy dependency.

## Installation

#### for development: 
- Install dependencies: `pip3 install -r requirements.txt`
- Run: `python3 app.py`
- Please also check some command line options with: `python3 app.py --help`

#### for production: 
- please see below how to build the docker container yourself or just pull the latest docker container with: `docker pull bigabig/mbot-spacy:latest`
- run the docker container: `docker run -p9999:9999 bigabig/mbot-spacy:latest`

## Usage (Summarization with TextRank)
This microservice provides one endpoint at http://localhost:9999/summarize.
POST a JSON request to this endpoint with following parameters
- text: A string that you want to summarize
- length: number of sentences that the summary should contain
- lang: language of input string 'de' or 'en'

The endpoint returns a string with <length> sentences.

Example Request:
```
{
'text': 'Some english sentence. Another english sentence.',
'length': 1,
'lang: 'en'
}
```

Example Response:
```
{
'summary': 'Some summary.',
}
```

## Usage (NLP)
This microservice provides one endpoint at http://localhost:9999/process.
POST a JSON request to this endpoint with following parameters:
- text: A string that you want to summarize
- lang: language of input string 'de' or 'en'

The endpoint returns a list of (token, pos, lemma, dep) tuples as json.

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

You can set the language e.g. with `python3 app.py -l de`

## Building the docker container
- Build the container: `docker build -t bigabig/mbot-spacy:latest .`
- (Optional) Test if the container is working:
  - Run the container: `docker run -p9999:9999 bigabig/mbot-spacy:latest`
  - View example output: visit http://localhost:9999/ & visit http://localhost:9999/de & visit http://localhost:9999/en 
