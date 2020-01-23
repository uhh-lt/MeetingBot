# build jar with assembly:assembly (maven)
# copy lt-keyterms-09.jar to /docker/ltkeyterms.jar
# docker build -t bigabig/mbot-keyterms:latest .
# docker run -p8090:8080 -d bigabig/mbot-keyterms:latest
# visit http://localhost:8090/swagger-ui.html

FROM openjdk:8-jdk-alpine
VOLUME /tmp
COPY ltkeyterms.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java","-Djava.security.egd=file:/dev/./urandom","-jar","app.jar"]
