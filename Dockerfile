FROM node:18-bullseye AS builder

WORKDIR /workspace

# Install deps at root which forwards to apps/web
COPY package.json yarn.lock* ./
COPY apps/web/package.json apps/web/yarn.lock* ./apps/web/

RUN corepack enable && corepack prepare yarn@1.22.22 --activate

WORKDIR /workspace/apps/web
COPY apps/web ./
RUN yarn install --frozen-lockfile
RUN yarn build

FROM node:18-bullseye AS runtime
WORKDIR /app
COPY --from=builder /workspace/apps/web/dist ./dist
RUN npm i -g serve
EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
