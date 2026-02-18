FROM node:18-bullseye AS builder

WORKDIR /app

# Install curl and ca-certificates then try to install Bun (may fail in some CI environments)
RUN apt-get update && apt-get install -y curl ca-certificates || true
RUN (curl -fsSL https://bun.sh/install | bash) || echo "bun installer failed, will fallback to yarn"

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
