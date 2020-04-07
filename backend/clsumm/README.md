# CLSUMM
This is a microservice for abstractive summarization with BERT. The original code of this project can be found here: [CLSUMM-LT](https://github.com/uhh-lt/CLSUMM-LT). Please also take a look at the original readme file for further information. We adoped this code to build a microservice.

Please note: This directory is just necessary to hold the model for the docker-compose files.
 
## Installation
- Download the model: [link](https://drive.google.com/file/d/1GH22mOP5qvImooHiMT3T276lOSNF2WZC/view?usp=sharing)
- Place the model into the folder /backend/clsumm/models/

#### for development: 
- Install dependencies: `pip3 install -r requirements.txt`
- Run: `python3 ./src/app.py`

#### for production: 
- please see below how to build the docker container yourself or just pull the latest docker container with: `docker pull bigabig/mbot-clsumm:latest`
- run the docker container: `docker-compose up -d`
 
## Usage
This microservice provides just one endpoint at http://localhost:5000/summarize.
POST a JSON request to this endpoint with following parameters
- text: A string that you want to summarize

The service returns a string.

Example Request:
```
{
'text': 'Some english sentence. Another english sentence.',
}
```

Example Response:
```
{
'summary': 'Some summary.',
}
```

## Languages
This service supports:
- english

## Building the docker container
- Build the container: `docker build -t bigabig/mbot-clsumm:latest .`
- (Optional) Test if the container is working:
  - Run the container: `docker-compose up -d`
  - View example output: visit http://localhost:5000/
