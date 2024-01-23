# frontend
FROM node:20-alpine AS typingjerboa-node-base
WORKDIR /app
COPY ./package*.json ./
RUN npm i
COPY . .
RUN npx next telemetry disable
RUN npx prisma generate
EXPOSE 3000

FROM typingjerboa-node-base AS typingjerboa-node-test
ENV NODE_ENV=test
# single & to make npm run dev a background process so npm test can run
CMD npx prisma migrate dev && npm run dev & npm test

FROM typingjerboa-node-base AS typingjerboa-node-dev
ENV NODE_ENV=development
ENV CHOKIDAR_USEPOLLING=true
ENV WATCHPACK_POLLING=true
RUN rm -rf src
CMD npm run dev

FROM typingjerboa-node-base AS typingjerboa-node-prod
RUN npm run build
CMD npm run start

# postgres
FROM postgres:16-alpine AS typingjerboa-postgres-base
EXPOSE 5432

FROM typingjerboa-postgres-base AS typingjerboa-postgres-test

FROM typingjerboa-postgres-base AS typingjerboa-postgres-dev

FROM typingjerboa-postgres-base AS typingjerboa-postgres-prod