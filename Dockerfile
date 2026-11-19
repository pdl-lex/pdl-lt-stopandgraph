# Stage 1: Build
FROM node:24-slim AS builder

WORKDIR /app

# Package files kopieren
COPY package.json package-lock.json* ./

# Dependencies installieren
RUN npm ci

# Source code kopieren
COPY . .

# Production build
RUN npm run build

# Stage 2: Production
FROM caddy:2-alpine

# Build-Artefakte vom Builder kopieren
COPY --from=builder /app/dist /srv

# Caddyfile kopieren
COPY Caddyfile /etc/caddy/Caddyfile

EXPOSE 80

CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile"]