FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=80
ENV DATA_DIR=/app/data

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/src ./src
COPY --from=builder /app/package.json ./package.json

RUN mkdir -p /app/data
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --retries=3 CMD wget --quiet --tries=1 --spider http://127.0.0.1/api/cms || exit 1
CMD ["node", "server/index.mjs"]
