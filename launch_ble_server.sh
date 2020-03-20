#!/bin/bash

UNBLOCK_RFKILL="sudo rfkill unblock all"
BLE_SERVER="sudo python src/server/ble_server.py"

echo "///////////////////  New launch at `date` \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\"
${UNBLOCK_RFKILL}
${BLE_SERVER}
