FROM tomcat
COPY ./target/capstone-0.1.war /usr/local/tomcat/webapps/capstone.war
