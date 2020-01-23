# spacy_api

pip3 install spacy flask flask_cors 

For German model support download the newest 'de' model with:

python3 -m spacy download de

(MIT license)

Standard port: 9000

Input:

POST http://localhost:9000/process
with input variable "text"

Output:

List of (token, pos, lemma, dep) tuples as json

Example request:

curl -d "text=auch wenn wir von dieser Zukunft noch etwas entfernt sind ist es heute schon sinnvoll über IT Ethik zu diskutieren" -X POST http://localhost:9000/process


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
