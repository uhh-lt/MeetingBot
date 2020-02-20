# Keyword Extraction
This is a microservice for keyword extraction.

## BUILD DOCKER
- Change into correct diretory: cd keywords/docker
- Build the container: docker build -t bigabig/mbot-keyterms .
- (Optional) Test if the container is working:
  - Run the container: docker run -p8090:8080 -d bigabig/mbot-keyterms
  - View the REST API: visit http://localhost:8090/swagger-ui.html
