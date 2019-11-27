#!/bin/bash

LAUNCH="node server.js"

while :
do
    echo "///////////////////  New launch at `date` \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\"
    ${LAUNCH}
    sleep 3
done
