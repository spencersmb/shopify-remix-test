#!/bin/bash
 
if [[ $VERCEL_GIT_COMMIT_REF == "staging"  ]] ; then 
  echo "This is our staging branch"
  npm run staging
else 
  echo "This is not our main branch"
  npm run build
fi