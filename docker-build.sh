#!/bin/sh

# Install any new library if added
# yarn
# Build frontend
yarn build

# build docker image
echo "Build started"
docker build -t gcr.io/aquilatrack-5x-dev-demo-test/frontend:1.0.3 .
echo "Build finished"
docker push gcr.io/aquilatrack-5x-dev-demo-test/frontend:1.0.3
echo "To pull the image, run: 'docker pull gcr.io/aquilatrack-5x-dev-demo-test/frontend:1.0.3'"
