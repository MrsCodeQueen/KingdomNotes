FROM node:18-bullseye AS builder

WORKDIR /app

# Install curl and ca-certificates then install Bun
RUN apt-get update && apt-get install -y curl ca-certificates && \
	curl -fsSL https://bun.sh/install | bash

ENV BUN_INSTALLER=/root/.bun/bin
ENV PATH="$BUN_INSTALLER:$PATH"

# Copy app files
COPY . .

# Use Bun to install and build
RUN bun --version || true
RUN bun install --non-interactive
RUN bun run build

FROM node:18-bullseye AS runtime
WORKDIR /app
COPY --from=builder /app/dist ./dist
RUN npm i -g serve
EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
