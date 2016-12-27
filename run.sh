#!/bin/sh -f
DOCKER_IMAGE_NAME=bkjeholt/mqtt-agent-tellstick
DOCKER_CONTAINER_NAME=hic-agent-tellstick

DOCKER_IMAGE_BASE_TAG=${1}

ARCHITECTURE=rpi

echo "------------------------------------------------------------------------"
echo "-- Run image:       $DOCKER_IMAGE_NAME:latest "

DOCKER_IMAGE=${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_BASE_TAG}-${ARCHITECTURE}

echo "------------------------------------------------------------------------"
echo "-- Remove docker container if it exists"
echo "-- Container:   $DOCKER_CONTAINER_NAME "
echo "------------------------------------------------------------------------"

docker rm -f $DOCKER_CONTAINER_NAME

echo "------------------------------------------------------------------------"
echo "-- Start container "
echo "-- Based on image: $DOCKER_IMAGE "
echo "------------------------------------------------------------------------"

echo "------------------------------------------------------------------------"

docker run -d \
           --restart="always" \
           --env MQTT_IP_ADDR="192.168.1.10" \
           --env MQTT_PORT_NO=1883 \
           --env DOCKER_CONTAINER_NAME=${DOCKER_CONTAINER_NAME} \
           --privileged \
           --device /dev/bus/usb:/dev/bus/usb \
           --name $DOCKER_CONTAINER_NAME \
           $DOCKER_IMAGE

