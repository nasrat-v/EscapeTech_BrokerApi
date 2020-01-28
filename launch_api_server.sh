#!/bin/bash

API_SERVER="node api_server.js"

while :
do
    echo "///////////////////  New launch at `date` \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\"
    ${API_SERVER}
    sleep 3
done
