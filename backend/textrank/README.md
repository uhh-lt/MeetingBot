# TextRank
This is a microservice for extractive summarization with TextRank.

## BUILD DOCKER
- Build the container: docker build -t bigabig/mbot-textrank:latest .
- (Optional) Test if the container is working:
  - Run the container: docker run -p5000:5000 bigabig/mbot-textrank:latest
  - View example output: visit http://localhost:5000/
  
## USAGE
This microservice provides just one endpoint at localhost:5000/summarize.
POST a JSON request at this endpoint with following parameters
- text: A string that you want to summarize
- length: number of sentences that the summary should contain
- lang: 'de' or 'en'

For example:
```
{
'text': 'Some english sentence. Another english sentence...',
'length': 1,
'lang: 'en'
}
```
