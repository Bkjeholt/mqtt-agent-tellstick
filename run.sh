#!/bin/sh -f
DOCKER_IMAGE_NAME=bkjeholt/mqtt-agent-ts-rpi
DOCKER_CONTAINER_NAME=hic-agent-ts


DOCKER_IMAGE=$(../SupportFiles/DockerSupport/get-latest-image-string.sh $DOCKER_IMAGE_NAME)

echo "------------------------------------------------------------------------"
echo "-- Run image:   ${DOCKER_IMAGE} "
echo "-- Container:   $DOCKER_CONTAINER_NAME "
echo "------------------------------------------------------------------------"
echo "-- Remove docker container if it exists"
echo "------------------------------------------------------------------------"

docker rm -f $DOCKER_CONTAINER_NAME > /dev/null

echo "------------------------------------------------------------------------"
echo "-- Start container "
echo "------------------------------------------------------------------------"

docker run -d \
           --restart="always" \
           --link mqtt-broker:mqtt \
           --privileged \
           --device /dev/bus/usb:/dev/bus/usb \
           --name $DOCKER_CONTAINER_NAME \
           $DOCKER_IMAGE

