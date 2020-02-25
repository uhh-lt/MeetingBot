# docker build -t bigabig/mbot-spacy:latest .
# docker run -p9000:9000 bigabig/mbot-spacy:latest
# http://localhost:9999/de to check if it is working
# Example request: curl -d "text=auch wenn wir von dieser Zukunft noch etwas entfernt sind ist es heute schon sinnvoll über IT Ethik zu diskutieren" -X POST http://localhost:9000/process

FROM python:3.6

COPY requirements.txt requirements.txt

RUN pip install -r requirements.txt

COPY app.py app.py

EXPOSE 9999

ENTRYPOINT [ "python", "app.py" ]
