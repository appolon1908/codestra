FROM node:22.22.2-alpine3.23 AS build

ARG SOURCE_REVISION=unknown
ARG APP_VERSION=development
ARG BUILD_CREATED=unknown

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ARG VITE_API_ENDPOINT
ARG VITE_PUBLIC_DEMO_PHONE
ARG VITE_PUBLIC_SALES_PHONE
ARG VITE_PUBLIC_SITE_URL
ENV VITE_API_ENDPOINT=${VITE_API_ENDPOINT}
ENV VITE_PUBLIC_DEMO_PHONE=${VITE_PUBLIC_DEMO_PHONE}
ENV VITE_PUBLIC_SALES_PHONE=${VITE_PUBLIC_SALES_PHONE}
ENV VITE_PUBLIC_SITE_URL=${VITE_PUBLIC_SITE_URL}
RUN npm run build

FROM nginxinc/nginx-unprivileged:1.31.5-alpine3.24

ARG SOURCE_REVISION=unknown
ARG APP_VERSION=development
ARG BUILD_CREATED=unknown
LABEL org.opencontainers.image.source="https://github.com/appolon1908/codestra" \
      org.opencontainers.image.revision="${SOURCE_REVISION}" \
      org.opencontainers.image.version="${APP_VERSION}" \
      org.opencontainers.image.created="${BUILD_CREATED}"

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
