#!/bin/bash -f

echo "---------------------------------------------------------------------------"
echo "-- Start deamon for tellstick to mqtt handling "
echo "---------------------------------------------------------------------------"
echo "-- Start the tellstick service "
echo "---------------------------------------------------------------------------"

/usr/sbin/telldusd &

echo "---------------------------------------------------------------------------"
echo "-- Start the deamon "
echo "---------------------------------------------------------------------------"

npm start
