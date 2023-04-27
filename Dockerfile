FROM node:16-alpine AS deps
RUN apk add --no-cache libc6-compat

WORKDIR /app

COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i; \
  else echo "Lockfile not found." && exit 1; \
  fi


FROM node:16-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

#Solana RPC
ARG SOLANA_ENDPOINT
ENV SOLANA_ENDPOINT $SOLANA_ENDPOINT
ENV NEXT_PUBLIC_SOLANA_RPC_URL $SOLANA_ENDPOINT

# Auction house
ARG AUCTION_HOUSE_ADDRESS
ENV NEXT_PUBLIC_AUCTION_HOUSE_ADDRESS $AUCTION_HOUSE_ADDRESS

# Referral API
ARG REFERRAL_KEY
ENV NEXT_PUBLIC_REFERRAL_KEY $REFERRAL_KEY

#bugsnag
ARG BUGSNAG_API_KEY
ENV NEXT_PUBLIC_BUGSNAG_API_KEY $BUGSNAG_API_KEY

RUN yarn build

FROM node:16-alpine AS runner
WORKDIR /app

ARG NODE_ENV
ENV NEXT_PUBLIC_ENVIRONMENT $NODE_ENV
ENV NODE_ENV $NODE_ENV

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

COPY --from=builder /app/public ./public

# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static


USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
