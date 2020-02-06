# TextRank
This is a microservice for extractive summarization with TextRank.

## BUILD DOCKER
- Build the container: docker build -t bigabig/mbot-textrank:latest .
- (Optional) Test if the container is working:
  - Run the container: docker run -p5000:5000 bigabig/mbot-textrank:latest
  - View example output: visit http://localhost:5000/
