# MoM (minutes of meetings) MeetingBot

MoM (minutes of meetings) MeetingBot is an automatic meeting transcription system with real-time recognition, summarization and visualization capabilities. MoM works without any cloud processing and does not require a network connection. Every processing step is local, even its speech recognition component, to address privacy concerns of meetings. MoM can be used to assisted writing a (summarized) protocol of a meeting, but may also help the hearing-impaired to follow a discussion.

The Minute Meeting Bot consists of different components:
- a frontend build with Node.js and Vue.js 
- many microservices that complement the frontend build with Java and Python 3
- a backend for automatic speech recognition build with Python 3 and Kaldi 

The code for the [frontend](./frontend/) and [microservices](./backend/) can be found in this repository. The ASR backend is hosted here: [kaldi-model-server](https://github.com/uhh-lt/kaldi-model-server).

![example screenshot](./MoM_screenshot.png?raw=true "MoM meetingbot example screenshot")

You can also watch a [English demo video](https://ltdata1.informatik.uni-hamburg.de/meetingbot/meetingbot_en.mp4) and a [German demo video](https://ltdata1.informatik.uni-hamburg.de/meetingbot/meetingbot_de.mp4) to get an impression of the system. For more information, see also our [Interspeech21 paper](./MoM_paper.pdf?raw=true).

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

## Citation

If you use Meetingbot, please cite our [paper](./MoM_paper.pdf?raw=true):

```
@InProceedings{Milde-et-al-2021-meetingbot,
  author = {Benjamin Milde, Tim Fischer, Steffen Remus and Chris Biemann},
  title = {{MoM}: Minutes of Meeting Bot},
  booktitle = {Proceedings of Interspeech 2021},
  year = {2021},
  address = {Brno, Czech Republic}
}
```
