FROM node:18-bullseye AS builder

WORKDIR /app

# Use corepack to ensure yarn@1 is available
RUN corepack enable && corepack prepare yarn@1.22.22 --activate

# Copy only web app manifests first for better caching
COPY package.json yarn.lock* ./

# Copy the rest of the web app
COPY . .

RUN yarn install --frozen-lockfile
RUN yarn build

FROM node:18-bullseye AS runtime
WORKDIR /app
COPY --from=builder /app/dist ./dist
RUN npm i -g serve
EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
