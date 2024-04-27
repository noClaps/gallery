FROM oven/bun

ARG RAILWAY_SERVICE_ID
ENV RAILWAY_SERVICE_ID=$RAILWAY_SERVICE_ID

COPY package.json bun.lockb ./
RUN --mount=type=cache,id=s/$RAILWAY_SERVICE_ID-/root/bun,target=/root/.bun/ bun install

COPY . ./
RUN --mount=type=cache,id=s/$RAILWAY_SERVICE_ID-node_modules/cache,target=./node_modules/.cache bun run build

CMD [ "bun", "start" ]
