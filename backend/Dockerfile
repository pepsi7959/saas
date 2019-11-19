from ubuntu:xenial
ENV term xterm
WORKDIR /app
RUN apt-get update \
  && apt-get -y install wget curl unzip dirmngr apt-transport-https lsb-release ca-certificates \
  && rm -rf /var/lib/apt/lists/*
RUN curl -sL https://deb.nodesource.com/setup_8.x | bash -
RUN apt-get install -y nodejs
RUN wget https://github.com/pepsi7959/saas/archive/master.zip \
  && unzip master.zip -d /tmp/ && mv /tmp/saas-master/backend/* /app/ && rm -rf  master.zip
RUN cp /app/config/production.conf-template.js /app/config/production.conf.js 
RUN npm install
ENV PORT 3002
CMD ["npm", "start"]