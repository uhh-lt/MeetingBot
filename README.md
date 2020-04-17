# MeetingBot
The Minute Meeting Bot consists of different components:
- a frontend build with Node.js and Vue.js 
- many microservices that complement the frontend build with Java and Python 3
- a backend for automatic speech recognition build with Python 3 and Kaldi 

The code for the [frontend](./frontend/) and [microservices](./backend/) can be found in this repository. The ASR backend is hosted here: [kaldi-model-server](https://github.com/uhh-lt/kaldi-model-server).

## Usage
Please note that the following instructions will start the frontend as well as all the microservices so that all functionalities of the frontend will work. 
However, this will NOT start the ASR backend. 
Therefore, speech input will not work. 
- Startup the frontend & microservice containers: `docker-compose -f docker-compose-prod.yml up -d`
- Visit the frontend: http://localhost:8080/

To get a complete working version of the Meeting Bot with frontend, microservices and backend please follow the instructions here: [Linux Guide](./linux-guide.md).

## Development
For detailed instructions on how to develop and build (for production) the frontend as well as the microservices please take a look at the corresponding readme files:
- [frontend](./frontend/)
- [microservices](./backend/)
