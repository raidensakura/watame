#!/bin/sh
FROM mhart/alpine-node:14.5.0 as builder

ADD src /watame
ADD package.json /watame
ADD yarn.lock /watame

WORKDIR /watame

RUN yarn install --frozen-lockfile

FROM containrrr/watchtower:latest

COPY --from=builder /watame /watame

WORKDIR /watame

CMD ["npm", "start"]
