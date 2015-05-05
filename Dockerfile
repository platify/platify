FROM tomcat
MAINTAINER David Bonner <dbonner@gmail.com>
COPY ./target/capstone-0.1.war /usr/local/tomcat/webapps/capstone.war
