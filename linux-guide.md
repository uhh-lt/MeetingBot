# Full Installation Instructions
This guide will help you to install the complete MoM Bot on your device. This means after the installation all three MoM Bot components will run on your system:
- the frontend for visualization
- a few microservices that complement the frontend
- the backend for automatic speech recognition

## 1. Requirements
Before continuing with the installation process, make sure that you meet the following requirements:
- Any linux distribution. We recommend [Ubuntu 18.04.4 LTS](https://ubuntu.com/download/desktop)
- Docker & docker-compose. Follow this guide for Ubuntu: [Install Docker Engine on Ubuntu](https://docs.docker.com/engine/install/ubuntu/)
- Git
- A microphone e.g. the build in microphone of your notebook or any other microphone. We recommend [Comica CVM-V02O XLR](http://www.comica-audio.com/products_detail/productId=72.html) in combination with [Scarlett 18i8 3rd Gen](https://focusrite.com/de/audio-interface/scarlett/scarlett-18i8).

## 2. Download docker containers
Now, we will download all the necessary docker containers that contain all components.
- Clone this repository: `git clone https://github.com/uhh-lt/MeetingBot.git`
- Change into this directory: `cd MeetingBot`
- Download the containers: `docker-compose -f docker-compose-suite.yml pull`

## 3. Run the docker containers
It is time to start-up all the containers.
- Run: `docker-compose -f docker-compose-suite.yml up -d`

This might take a while... Please check with `docker ps` if all docker containers are up and running before continuing with the next step.

## 4. Configuring the ASR
All containers are running. However, we still need to tell the ASR backend which microphone to use.
- List all possible input devices: `docker exec kamose asr -l`
The output could e.g. look like this. In this case, Input Device id 1 seems appropiate:
```
Input Device id  0  -  HDA Intel PCH: ALC3234 Analog (hw:0,0) 
Output Device id  0  -  HDA Intel PCH: ALC3234 Analog (hw:0,0)
Input Device id  1  -  HDA Intel PCH: ALC3234 Alt Analog (hw:0,2) 
Output Device id  2  -  HDA Intel PCH: HDMI 0 (hw:0,3) 
Output Device id  3  -  HDA Intel PCH: HDMI 1 (hw:0,7) 
Output Device id  4  -  HDA Intel PCH: HDMI 2 (hw:0,8) 
Output Device id  5  -  HDA NVidia: HDMI 0 (hw:1,3) 
Output Device id  6  -  HDA NVidia: HDMI 1 (hw:1,7) 
Input Device id  7  -  sysdefault Output Device id  7  -  sysdefault 
Output Device id  8  -  front Output Device id  9  -  surround40 
```
- Start the ASR with the appropriate input device: `docker exec kamose asr -m 1 -c 1 -t -r 48000 -cs 8192 -bs 5 -a linear --wait`

This command is really long. Let's analyze it:
- use the input device 1 (-m) 
- one channel (-c)
- start the server in a threaded mode (-t)
- use 48khz sample rate (-r)
- use a chunksize of 8192 (-cs)
- use a beamsize of 5 (-bs)
- use a linear resampling algorithm (-a)
- wait for the gui to start the asr (--wait)

For more information on the parameters please try out `docker exec kamose asr --help`.

## 5. Use the MoM Bot
Finally, we can use the MoM Bot. Therefore
- Visit http://localhost:8080
- Press the green Start Button
- Say something :)

## Additional Notes
- Please understand that currently the dockerized MoM Bot only works on Linux! This is because it is only possible with Linux to forward audio devices to a docker container. It is also possible to run the MoM Bot on a Mac. However, this is a bit more complicated as you need to build and compile dependencies of the ASR backend yourself. You can find instructions for this [here](https://github.com/uhh-lt/kaldi-model-server#installation).
- Please note that there is currently a bug in the dockerized MoM Bot solutions that allows only one microphone. This is due to some issues with samplerates and a resampler. We are currently investigating this bug.
- If you run into any other problems, please feel free to contact us!
