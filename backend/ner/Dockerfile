# docker build -t bigabig/mbot-ner:latest .
# docker run -p9000:9000 bigabig/mbot-ner:latest
# visit http://localhost:9000/en or http://localhost:9000/de to check if it is working
# Example request: curl -d "text=auch wenn wir von dieser Zukunft noch etwas entfernt sind ist es heute schon sinnvoll über IT Ethik zu diskutieren" -X POST http://localhost:9000/process

FROM python:3.6

COPY requirements.txt requirements.txt

RUN pip install -r requirements.txt

COPY app.py app.py

RUN python -m spacy download de

RUN python -m spacy download en

EXPOSE 9000

ENTRYPOINT [ "python" ]

CMD [ "app.py" ]
