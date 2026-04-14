FROM node:22.19.0 as builder

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml ./

RUN pnpm install

COPY . .

RUN pnpm build

FROM node:22.19.0 as runner

WORKDIR /app

ENV NODE_ENV=production

COPY package.json pnpm-lock.yaml ./

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

CMD [ "node", "dist/main" ]