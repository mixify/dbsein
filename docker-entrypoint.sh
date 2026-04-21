#!/bin/sh

if [ -n "$GITHUB_TOKEN" ] && [ -n "$GITHUB_REPO" ]; then
  # Set remote with token auth
  git remote remove origin 2>/dev/null
  git remote add origin "https://x-access-token:${GITHUB_TOKEN}@github.com/${GITHUB_REPO}.git"

  # Rename branch to main and track remote
  git branch -M main
  git fetch origin main 2>/dev/null
  git branch --set-upstream-to=origin/main main 2>/dev/null

  # Pull latest data
  git merge origin/main --no-edit 2>/dev/null || true
fi

exec npm start
