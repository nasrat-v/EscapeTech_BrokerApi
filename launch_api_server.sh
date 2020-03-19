#!/bin/bash

API_SERVER="node api_server.js --ble --ip $(hostname -i) --port 3000"

while :
do
    echo "///////////////////  New launch at `date` \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\"
    ${API_SERVER}
    sleep 3
done
