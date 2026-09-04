FROM node:22.22.2-alpine3.23 AS build

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ARG VITE_API_ENDPOINT
ENV VITE_API_ENDPOINT=${VITE_API_ENDPOINT}
RUN npm run build

FROM nginxinc/nginx-unprivileged:1.29-alpine

USER root
ARG ALPINE_SECURITY_REFRESH=2026-09-04
RUN test -n "$ALPINE_SECURITY_REFRESH" \
  && apk update \
  && apk upgrade --no-cache \
  && rm -rf /var/cache/apk/*

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build --chown=101:101 /app/dist /usr/share/nginx/html

USER 101:101
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:8080/healthz || exit 1
