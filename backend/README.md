# Backend
The mom bot utilizes many microservices to provide its features.

## Microservices
- keyword microservice: [keywords](./keywords)
- summarization microservices: [textrank](./textrank) & [clsumm](./clsumm)
- pos tagging & lemmatization microservice: [nlp](./nlp)
- a microservice that combines textrank with pos tagging & lemmatization for performance: [spacy](./spacy)
