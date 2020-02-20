# first build the project with npm run build
# docker build -t bigabig/mbot-frontend:latest .
# docker run -p8080:8080 bigabig/mbot-frontend:latest
# visit http://localhost:8080 to check if it is working

FROM node:latest

# install simple http server for serving static content
RUN npm install -g http-server

# make the 'app' folder the current working directory
WORKDIR /app

# copy project files and folders to the current working directory (i.e. 'app' folder)
COPY ./dist ./dist

EXPOSE 8080
CMD [ "http-server", "dist" ]
