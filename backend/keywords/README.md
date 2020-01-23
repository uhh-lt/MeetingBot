# Keyword Extraction
This is a microservice for keyword extraction.

## BUILD DOCKER
- Change into correct diretory: cd wikihow-qa/services/wikihow-keywords/docker
- Build the container: docker build -t bigabig/wikihow-keywords .
- (Optional) Test if the container is working:
  - Run the container: docker run -p8090:8080 -d bigabig/wikihow-keywords
  - View the REST API: visit http://localhost:8090/swagger-ui.html
