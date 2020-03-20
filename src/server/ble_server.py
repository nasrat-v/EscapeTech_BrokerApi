#!/usr/bin/env python

from __future__ import print_function
import sys
import os
import time
import json
import zerorpc
from abc import abstractmethod

from blue_st_sdk.manager import Manager
from blue_st_sdk.manager import ManagerListener
from blue_st_sdk.node import NodeListener
from blue_st_sdk.feature import FeatureListener
from blue_st_sdk.features.audio.adpcm.feature_audio_adpcm import FeatureAudioADPCM
from blue_st_sdk.features.audio.adpcm.feature_audio_adpcm_sync import FeatureAudioADPCMSync


# CONSTANTS
SRV_BLE_HOSTNAME = "tcp://0.0.0.0:4242"
SCANNING_TIME_s = 2
DEVICE = "BCN-002"
FEATURE_TEMP = "Temperature"
FEATURE_HUMI = "Humidity"
FEATURE_PRES = "Pressure"
FEATURE_MAGN = "Magnetometer"
FEATURE_GYRO = "Gyroscope"
FEATURE_ACCE = "Accelerometer"
ERROR = "error"
UNIT_MAGN = "mGa"
UNIT_GYRO = "dps"
UNIT_ACCE = "mg"
NOTIFICATIONS = 1


#
# Implementation of the interface used by the Manager class to notify that a new
# node has been discovered or that the scanning starts/stops.
#
class MyManagerListener(ManagerListener):


    def on_discovery_change(self, manager, enabled):
        print('Discovery %s.' % ('started' if enabled else 'stopped'))
        if not enabled:
            print()


    def on_node_discovered(self, manager, node):
        print('New device discovered: %s.' % (node.get_name()))


#
# Implementation of the interface used by the Node class to notify that a node
# has updated its status.
#
class MyNodeListener(NodeListener):


    def on_connect(self, node):
        print('Device %s connected.' % (node.get_name()))


    def on_disconnect(self, node, unexpected=False):
        print('Device %s disconnected%s.' % \
            (node.get_name(), ' unexpectedly' if unexpected else ''))
        if unexpected:
            print('\nExiting...\n')
            sys.exit(0)
        os._exit(0)


#
# Implementation of the interface used by the Feature class to notify that a
# feature has updated its data.
#
class MyFeatureListener(FeatureListener):
    _notifications = 0
    """Counting notifications to print only the desired ones."""


    def on_update(self, feature, sample):
        if self._notifications < NOTIFICATIONS:
            self._notifications += 1
            print(feature)


#
# This class is the SDK logic to communicate with BLE devices.
# It gonna be run on an ZeroRPC server (ZeroMQ) and available to invokation throught TCP
#
class ServerBLE(object):
    _device = []

    def find_device(self, discovered_devices):
        for device in discovered_devices:
            if device.get_name() == DEVICE:
                print('Device found')
                node_listener = MyNodeListener()
                device.add_listener(node_listener)
                return device
        print(ERROR)
        return ERROR


    def find_feature(self, device, feature_name):
        features = device.get_features()
        for feature in features:
            if feature.get_name() == feature_name:
                return feature
        return ERROR


    def connect_to_device(self):
        manager = Manager.instance()
        manager_listener = MyManagerListener()
        manager.add_listener(manager_listener)
        print('Scanning Bluetooth devices...\n')
        # Synchronous
        manager.discover(SCANNING_TIME_s)
        discovered_devices = manager.get_nodes()
        if not discovered_devices:
            print('No Bluetooth devices found. Exiting...\n')
            sys.exit(0)
        self._device = self.find_device(discovered_devices)
        if self._device == ERROR:
            print('Device not found.\n')
            sys.exit(0)
        print('Connecting to %s...' % (self._device.get_name()))
        if not self._device.connect():
            print('Connection failed.\n')
            sys.exit(0)


    def get_data_feature(self, feature_name):
        feature = self.find_feature(self._device, feature_name)
        if feature == ERROR:
            print('Feature not found.\n')
            sys.exit(0)
        feature_listener = MyFeatureListener()
        feature.add_listener(feature_listener)
        self._device.enable_notifications(feature)
        notifications = 0
        # Wait
        while notifications < NOTIFICATIONS:
            if self._device.wait_for_notifications(0.05):
                notifications += 1
        self._device.disable_notifications(feature)
        feature.remove_listener(feature_listener)
        # Parse and keep only value
        return str(feature)

    
    def parseToJson(self, data, unit):
        jsonData = '{ \"X\": \"' + data.split(unit)[0].split(':')[1].strip()
        jsonData += ' ' + unit + '\", \"Y\": \"' + data.split(unit)[1].split(':')[1].strip()
        jsonData += ' ' + unit + '\", \"Z\": \"' + data.split(unit)[2].split(':')[1].strip()
        jsonData += ' ' + unit + '\" }'
        return jsonData


    def get_temperature(self):
        data = self.get_data_feature(FEATURE_TEMP)
        return data.split('): ')[1].strip()


    def get_humidity(self):
        data = self.get_data_feature(FEATURE_HUMI)
        return data.split('): ')[1].strip()


    def get_pressure(self):
        data = self.get_data_feature(FEATURE_PRES)
        return data.split('): ')[1].strip()


    def get_magnetometer(self):
        data = self.get_data_feature(FEATURE_MAGN)
        data = data.split('): (')[1]
        return self.parseToJson(data, UNIT_MAGN)
        


    def get_gyroscope(self):
        data = self.get_data_feature(FEATURE_GYRO)
        data = data.split('): (')[1]
        return self.parseToJson(data, UNIT_GYRO)


    def get_accelerometer(self):
        data = self.get_data_feature(FEATURE_ACCE)
        data = data.split('): (')[1]
        return self.parseToJson(data, UNIT_ACCE)



# MAIN APPLICATION
def main(argv):
    print('BLE Server start...')
    try:
        server = zerorpc.Server(ServerBLE())
        server.bind(SRV_BLE_HOSTNAME)
        server.run()
    except KeyboardInterrupt:
        try:
            print('\nExiting...\n')
            sys.exit(0)
        except SystemExit:
            os._exit(0)



if __name__ == "__main__":
    main(sys.argv[1:])
