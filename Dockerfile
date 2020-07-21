FROM mhart/alpine-node:14.5.0 as builder

ADD src /watame
ADD package.json /watame
ADD yarn.lock /watame

WORKDIR /watame

RUN cp src/config.example.js /watame/config.example.js

RUN yarn install --frozen-lockfile

FROM containrrr/watchtower:latest

COPY --from=builder /watame /watame
WORKDIR /watame

CMD ["sh", "entrypoint.sh"]
