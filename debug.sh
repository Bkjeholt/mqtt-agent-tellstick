#!/bin/sh -f

ROOT_PATH=$(pwd)

echo "------------------------------------------------------------------------"
echo "-- Download the latest javascript files "
echo "------------------------------------------------------------------------"
echo ""
sh ../node-js/dropbox-download-js.sh

echo "------------------------------------------------------------------------"
echo "-- Stop and delete executing container"
echo "------------------------------------------------------------------------"
echo ""
docker rm -f hic-agent-ovpn

echo "------------------------------------------------------------------------"
echo "-- Start container"
echo "------------------------------------------------------------------------"
echo ""
docker run -d \
           --volumes-from openvpn-data-vol \
           -v $ROOT_PATH/js:/usr/src/app/js \
           --env AGENT_NAME="hic-agent-ovpn" \
           --env AGENT_REV="0.1.0" \
           --env MQTT_IP_ADDR="192.168.1.78" \
           --env MQTT_PORT_NO="1883" \
           --env MQTT_USER="NA" \
           --env MQTT_PASSWORD="NA" \
           --name hic-agent-ovpn \
           mqtt-agent-ovpn:latest
