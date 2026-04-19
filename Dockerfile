FROM node:20-slim

RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# init git for data commits
RUN git init && \
    git config user.email "dbsein@bot" && \
    git config user.name "dbsein" && \
    git add -A && \
    git commit -m "init" || true

RUN npm run build

EXPOSE 3000

# entrypoint: set remote if GITHUB_TOKEN is provided, then start
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

CMD ["/docker-entrypoint.sh"]
