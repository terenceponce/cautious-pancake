FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json tsconfig.base.json ./
COPY packages/api-types packages/api-types
COPY apps/server apps/server
RUN npm ci -w apps/server && npm run build -w apps/server

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json tsconfig.base.json ./
COPY packages/api-types packages/api-types
COPY apps/server/package.json apps/server/package.json
RUN npm ci --omit=dev -w apps/server
COPY --from=build /app/apps/server/dist apps/server/dist
USER node
EXPOSE 3000
HEALTHCHECK --interval=10s --timeout=3s --retries=3 CMD node -e "fetch('http://localhost:3000/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "apps/server/dist/server.js"]
