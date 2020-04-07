# Keyword Extraction
This is a microservice for keyword extraction based on [lt-keyterms](https://github.com/uhh-lt/lt-keyterms).

## Installation

#### for development: 
- import this project in any modern Java IDE as Maven project
- wait for Maven to finish downloading the dependencies
- run Application.java

#### for production: 
- please see below how to build the docker container yourself or just pull the latest docker container with: `docker pull bigabig/mbot-keyterms:latest`
- run the docker container: `docker run -p8090:8080 -d bigabig/mbot-keyterms:latest`

## Usage
This microservice provides multiple endpoints that you can test on http://localhost:8090/swagger-ui.html once this microservice is running. However, the most important endpoint is at http://localhost:8090/extractKeywords.
POST a JSON request to this endpoint with following parameters:
- count: The number of keywords that you want
- text: A string that you want to analyze
- lang: language of input string e.g. 'eng' or 'deu' (see supported languages below)

The endpoint returns a list of keyword objects (word, score) as json.

Example request:
```
{
  "count": 3,
  "lang": "deu",
  "text": "Auch wenn wir von dieser Zukunft noch etwas entfernt sind ist es heute schon sinnvoll über IT Ethik zu diskutieren"
}
```

Example response:
```
{
  "keywords": [
    {
      "word": "IT Ethik",
      "score": 16.368701058225646
    },
    {
      "word": "diskutieren",
      "score": 15.694881278289763
    },
    {
      "word": "sinnvoll",
      "score": 13.640744632121729
    }
  ]
}
```

## Languages
This service supports:
- arabic (ara)
- chinese (zho)
- danish (dan)
- dutch (nld)
- english (eng)
- finnish (fin)
- french (fra)
- german (deu)
- hungarian (hun)
- italian (ita)
- norwegian (nor)
- portuguese (por)
- romanian (ron)
- russian (rus)
- spanish (spa)
- swedish (swe)
- turkish (tur)

## Building the docker container
- Build .jar file in your Java IDE with Maven assembly:assembly
- Copy keywords/target/lt-keyterms-09.jar to keywords/docker/ltkeyterms.jar
- Change into correct directory: `cd keywords/docker/`
- Build the container: `docker build -t bigabig/mbot-keyterms:latest .`
- (Optional) Test if the container is working:
  - Run the container: `docker run -p8090:8080 -d bigabig/mbot-keyterms:latest`
  - View the REST API: visit http://localhost:8090/swagger-ui.html
