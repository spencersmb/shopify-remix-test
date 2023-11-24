#!/bin/bash

echo "Current branch: $VERCEL_GIT_COMMIT_REF"

if [[ $VERCEL_GIT_COMMIT_REF == "staging" ]]; then 
  echo "This is our staging branch"
  # Replace with a basic command for testing
  npm run staging
else 
  echo "This is not our main branch"
  # Replace with a basic command for testing
  npm run build
fi