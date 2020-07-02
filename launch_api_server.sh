#!/bin/bash

RUN_SERVER="node src/server/api_server.js"
API_ARGS="--ipApi $(hostname -i) --portApi 3000"
BLE_ARGS="--ipBle 127.0.0.1 --portBle 4242"
ARM_ARGS="--ipArm 92.92.77.7 --portArm 4242"
DASHBOARD_ARGS="--ipDashboard $(hostname -i) --portDashboard 8080"
LED_MSG_ARGS="--ipLedMessenger 192.168.2.3"
TUYA_ARGS="--tuya"

while :
do
    echo "///////////////////  New launch at `date` \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\"
    ${RUN_SERVER} ${API_ARGS} ${BLE_ARGS} ${TUYA_ARGS} ${DASHBOARD_ARGS} ${LED_MSG_ARGS}
    sleep 3
done
