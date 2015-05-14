FROM tomcat
MAINTAINER David Bonner <dbonner@gmail.com>
COPY ./target/capstone-*.war /usr/local/tomcat/webapps/capstone.war
