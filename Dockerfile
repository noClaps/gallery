FROM oven/bun

COPY package.json bun.lockb ./
RUN bun install

COPY . ./
RUN bun run build

CMD [ "bun", "start" ]
