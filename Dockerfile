FROM oven/bun

COPY package.json bun.lockb ./
RUN --mount=type=cache,id=s/65c7923a-42e4-4b81-8611-a0e3ef8c4bb7-/root/bun,target=/root/.bun bun install

COPY . ./
RUN --mount=type=cache,id=s/65c7923a-42e4-4b81-8611-a0e3ef8c4bb7-node_modules/cache,target=node_modules/.cache bun run build

CMD [ "bun", "start" ]
