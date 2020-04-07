# docker build -t bigabig/mbot-spacy:latest .
# docker run -p9999:99999 bigabig/mbot-spacy:latest

FROM python:3.6

COPY requirements.txt requirements.txt

RUN pip install -r requirements.txt

COPY app.py app.py

EXPOSE 9999

ENTRYPOINT [ "python", "app.py" ]
