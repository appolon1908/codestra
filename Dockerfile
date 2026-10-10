FROM node:22.22.2-alpine3.23 AS build

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ARG VITE_API_ENDPOINT
ENV VITE_API_ENDPOINT=${VITE_API_ENDPOINT}
RUN npm run build

FROM nginxinc/nginx-unprivileged:1.31.5-alpine3.24

USER root
# Require the patched TIFF package; a cached unconstrained upgrade retained
# 4.7.1-r0 and failed the required CVE-2026-4775 container scan.
RUN apk upgrade --no-cache \
    && apk add --no-cache "tiff>=4.7.2-r0"

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build --chown=101:101 /app/dist /usr/share/nginx/html

USER 101:101
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:8080/healthz || exit 1
