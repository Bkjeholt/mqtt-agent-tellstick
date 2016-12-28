#!/bin/sh -f
DOCKER_IMAGE_NAME=bkjeholt/mqtt-agent-ts-rpi
DOCKER_CONTAINER_NAME=hic-agent-ts

ROOT_PATH=$(pwd)

DOCKER_IMAGE=$(../SupportFiles/DockerSupport/get-latest-image-string.sh $DOCKER_IMAGE_NAME)

echo "------------------------------------------------------------------------"
echo "-- Run image:   ${DOCKER_IMAGE} "
echo "-- Container:   $DOCKER_CONTAINER_NAME "
echo "------------------------------------------------------------------------"
echo "-- Remove docker container if it exists"
echo "------------------------------------------------------------------------"

docker rm -f $DOCKER_CONTAINER_NAME > /dev/null
docker rm -f $DOCKER_CONTAINER_NAME-debug > /dev/null

echo "------------------------------------------------------------------------"
echo "-- Download latest javascript files "
echo "------------------------------------------------------------------------"

../SupportFiles/DropBox/download-js.sh

echo "------------------------------------------------------------------------"
echo "-- Start container "
echo "------------------------------------------------------------------------"

docker run -it \
           --rm \
           --link mqtt-broker:mqtt \
           --privileged \
           --device /dev/bus/usb:/dev/bus/usb \
           --name ${DOCKER_CONTAINER_NAME}-debug \
           -v $ROOT_PATH/js:/usr/src/app/js \
           $DOCKER_IMAGE /bin/bash