# Frontend
The frontend provides many visualization features for meetings. 

## Workflow
1. The mom bot users speak something
2. The speech input is converted into text by the ASR backend
3. The text input is sent to the frontend and is visualized
4. The frontend sends parts of the text input to microservices for further analysis and more advanced visualizations

## Features
- conversation history with various visualization options
- keyword highlighting
- word cloud of current keywords
- conversation shares
- import & visualize meeting agenda from emails (supports .ics files)
- visualization of elapsed time in combination with agenda points to keep an eye on the time and not to prolong meetings unnecessarily long
- editor to fix transcription errors with visual aid
- export to PDF
- automatic summarization of spoken content per agenda point with various summarization methods

## Installation

#### for development: 
- Install dependencies: `npm install`
- Run: `npm run serve`

#### for production: 
- please see below how to build the docker container yourself or just pull the latest docker container with: `docker pull bigabig/mbot-frontend:latest`
- run the docker container: `docker run -p8080:8080 bigabig/mbot-frontend:latest`

## Building the docker container
- Build the frontend: `npm run build`
- Build the container: `docker build -t bigabig/mbot-frontend:latest .`
- (Optional) Test if the container is working:
  - Run the container: `docker run -p8080:8080 bigabig/mbot-frontend:latest`
  - Visit http://localhost:8080 to check if it is working

## Developer commands
```
Project setup:
npm install

Start docker containers:
docker-compose up -d

Stop docker containers:
docker-compose down

Compiles and hot-reloads for development:
npm run serve

Compiles and minifies for production:
npm run build

Run your tests:
npm run test

Lints and fixes files:
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
