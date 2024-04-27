FROM oven/bun

ARG RAILWAY_SERVICE_ID
RUN echo $RAILWAY_SERVICE_ID

COPY package.json bun.lockb ./
RUN bun install

COPY . ./
RUN bun run build

CMD [ "bun", "start" ]
