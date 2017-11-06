#XXX run appc install before run docker build to include connectors
FROM mhart/alpine-node:5.12.0

# Magic to make Arrow think we're running in prod
ENV serverId 'magic'
ENV appid 'magic'
ENV PORT 80

ADD package.json /tmp/package.json
RUN cd /tmp && npm install --production
RUN mkdir -p /opt/app && cp -a /tmp/node_modules /opt/app/
WORKDIR /opt/app

# Copy files
COPY . /opt/app

ENV NODE_ENV production
CMD npm start
