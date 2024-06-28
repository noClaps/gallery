FROM oven/bun

COPY package.json bun.lockb ./
RUN --mount=type=cache,id=s/fcea8960-e9ec-4ce8-bc36-c0c33c1c77bb-/root/bun,target=/root/.bun bun install

COPY . ./
RUN --mount=type=cache,id=s/fcea8960-e9ec-4ce8-bc36-c0c33c1c77bb-node_modules/cache,target=node_modules/.cache bun run build

CMD [ "bun", "start" ]
