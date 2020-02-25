# First, build the project with npm run build
# How to tag:
# - One image with latest tag
# - One image with commit id tag: get commit id with git log --abbrev-commit
# - One image with version number: current version is 1.0
# Build:
# - docker build -t bigabig/mbot-frontend:latest .
# - docker build -t bigabig/mbot-frontend:<commit id> .
# - docker build -t bigabig/mbot-frontend:<version number> .
# Push:
# - docker push bigabig/mbot-frontend:latest
# - docker push bigabig/mbot-frontend:<commit id>
# - docker push bigabig/mbot-frontend:<version number>
# (Optional) Test:
# - docker run -p8080:8080 bigabig/mbot-frontend:latest
# - visit http://localhost:8080 to check if it is working

FROM node:latest

# install simple http server for serving static content
RUN npm install -g http-server

# make the 'app' folder the current working directory
WORKDIR /app

# copy project files and folders to the current working directory (i.e. 'app' folder)
COPY ./dist ./dist

EXPOSE 8080
CMD [ "http-server", "dist" ]
