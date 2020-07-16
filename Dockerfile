FROM mhart/alpine-node:14.5.0
COPY . /watame

WORKDIR /watame

RUN cp /watame/src/config.example.js /watame/src/config.js

RUN yarn install --frozen-lockfile

CMD ["node", "src/index.js"]
