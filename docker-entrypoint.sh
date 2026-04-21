#!/bin/sh

if [ -n "$GITHUB_TOKEN" ] && [ -n "$GITHUB_REPO" ]; then
  REMOTE_URL="https://x-access-token:${GITHUB_TOKEN}@github.com/${GITHUB_REPO}.git"

  # Clone actual repo into a temp dir, then copy .git into /app
  if [ ! -d "/app/.git" ]; then
    git clone --bare "$REMOTE_URL" /tmp/repo.git
    git init /app
    git -C /app remote add origin "$REMOTE_URL"
    git -C /app fetch origin main
    git -C /app reset origin/main
    git -C /app checkout -- data/ public/images/ 2>/dev/null || true
  else
    git -C /app remote set-url origin "$REMOTE_URL"
    git -C /app fetch origin main
    git -C /app reset origin/main
    git -C /app checkout -- data/ public/images/ 2>/dev/null || true
  fi

  git -C /app config user.email "dbsein@bot"
  git -C /app config user.name "dbsein"
  git -C /app branch -M main
  git -C /app branch --set-upstream-to=origin/main main 2>/dev/null
fi

exec npm start
