# TextRank
This is a microservice for extractive summarization with TextRank.
 
## Installation

#### for development: 
- Install dependencies: `pip3 install -r ./app/requirements.txt`
- For german model support download the newest 'de' model with: `python -m spacy download de_core_news_md`
- For english model support download the newest 'en' model with: `python -m spacy download en_core_web_lg`
- Run: `python3 ./app/app.py`

#### for production: 
- please see below how to build the docker container yourself or just pull the latest docker container with: `docker pull bigabig/mbot-textrank:latest`
- run the docker container: `docker run -p5000:5000 bigabig/mbot-textrank:latest`
 
## Usage
This microservice provides just one endpoint at http://localhost:5000/summarize.
POST a JSON request to this endpoint with following parameters
- text: A string that you want to summarize
- length: number of sentences that the summary should contain
- lang: language of input string 'de' or 'en'

The service returns a string with <length> sentences.

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
TODO
```

## Languages
This service supports:
- english (en)
- german (de)

## Building the docker container
- Build the container: `docker build -t bigabig/mbot-textrank:latest .`
- (Optional) Test if the container is working:
  - Run the container: `docker run -p5000:5000 bigabig/mbot-textrank:latest`
  - View example output: visit http://localhost:5000/
