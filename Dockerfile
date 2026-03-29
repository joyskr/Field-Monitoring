FROM node:22.12-alpine AS deps
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./
RUN npm ci

FROM node:22.12-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV AUTH_TRUST_HOST=true
RUN npm run build

FROM node:22.12-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV AUTH_TRUST_HOST=true
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
CMD ["node_modules/.bin/next", "start"]
