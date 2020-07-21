FROM mhart/alpine-node:14.5.0 as builder

ADD src /watame
ADD package.json /watame
ADD yarn.lock /watame

WORKDIR /watame

RUN yarn install --frozen-lockfile

FROM mhart/alpine-node:14.5.0

COPY --from=builder /watame /watame

WORKDIR /watame

CMD ["npm", "start"]
