FROM cypress/base:10

WORKDIR /opt/lifeomic

COPY . /opt/lifeomic

RUN yarn && rm .npmrc

ENTRYPOINT [ "yarn"]