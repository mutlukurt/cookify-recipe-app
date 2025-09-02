#!/bin/bash

# Build the project
npm run build

# Create docs directory if it doesn't exist
mkdir -p docs

# Copy built files to docs directory
cp -r dist/* docs/

# Add and commit changes
git add docs/
git commit -m "Update GitHub Pages deployment"

# Push to GitHub
git push origin main

echo "Deployment completed! Your site should be available at https://mutlukurt.github.io/cookify-recipe-app/"
