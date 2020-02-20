# docker build -t bigabig/mbot-textrank:latest .
FROM python:3.6

COPY app/requirements.txt /app/requirements.txt

WORKDIR /app

RUN pip install -r requirements.txt

RUN python -m spacy download en_core_web_lg

RUN python -m spacy download de_core_news_md

COPY app /app

EXPOSE 5000

ENTRYPOINT [ "python" ]

CMD [ "app.py" ]
