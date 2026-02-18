FROM node:18-bullseye AS builder

WORKDIR /app

# Install curl, ca-certificates and unzip; then vendor a pinned Bun release for the current architecture
RUN apt-get update && apt-get install -y curl ca-certificates unzip || true

# Pin Bun version to avoid network-installer indeterminism
ENV BUN_VERSION=1.0.18
ENV BUN_DIR=/root/.bun

RUN arch=$(uname -m) && \
	if [ "$arch" = "x86_64" ] || [ "$arch" = "amd64" ]; then asset="bun-linux-x64.zip"; \
	elif [ "$arch" = "aarch64" ] || [ "$arch" = "arm64" ]; then asset="bun-linux-aarch64.zip"; \
	else echo "unknown arch: $arch, attempting x64" && asset="bun-linux-x64.zip"; fi && \
	url="https://github.com/oven-sh/bun/releases/download/bun-v${BUN_VERSION}/${asset}" && \
	echo "Downloading Bun from $url" && \
	curl -fsSL -o /tmp/bun.zip "$url" && \
	mkdir -p ${BUN_DIR} && unzip /tmp/bun.zip -d ${BUN_DIR} && rm /tmp/bun.zip || echo "bun download/extract failed, will fallback to yarn"

# Ensure Bun is on PATH if installed
ENV BUN_INSTALLER=/root/.bun/bin
ENV PATH="$BUN_INSTALLER:$PATH"

# Copy app files
COPY . .

# Prefer Bun for install/build, but fallback to Yarn if Bun is not available
RUN if command -v bun >/dev/null 2>&1; then \
			echo "Using Bun" && bun --version && bun install --non-interactive && bun run build ; \
		else \
			echo "Bun not available, falling back to Yarn" && corepack enable && corepack prepare yarn@1.22.22 --activate && yarn install --frozen-lockfile && yarn build ; \
		fi

FROM node:18-bullseye AS runtime
WORKDIR /app
COPY --from=builder /app/dist ./dist
RUN npm i -g serve
EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
