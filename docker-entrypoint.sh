#!/bin/sh

# If GITHUB_TOKEN and GITHUB_REPO are set, configure remote and pull latest data
if [ -n "$GITHUB_TOKEN" ] && [ -n "$GITHUB_REPO" ]; then
  git remote remove origin 2>/dev/null
  git remote add origin "https://x-access-token:${GITHUB_TOKEN}@github.com/${GITHUB_REPO}.git"

  # Pull latest data if remote has commits
  git fetch origin main 2>/dev/null && git merge origin/main --no-edit 2>/dev/null || true
fi

exec npm start
