/************************************************************************
 Product    : Home information and control
 Date       : 2017-01-31
 Copyright  : Copyright (C) 2016-2017 Kjeholt Engineering. All rights reserved.
 Contact    : dev@kjeholt.se
 Url        : http://www-dev.kjeholt.se
 Licence    : ---
 ---------------------------------------------------------
 File       : mqtt-agent-ovpn/nodeTellstick.js
 Version    : 0.3.1
 Author     : Bjorn Kjeholt
 ---------------------------------------------------------
 
 *************************************************************************/

var telldus = require('telldus');

// var dimDev = require('./nodes/dim');
var switchDev = require('./nodes/switch');

var nodeTellstick = function (ci) {
    var self = this;
	
//    this.nodeInfo = [];
    
//    this.actionQueue = [];
//    this.ongoingActionScan = 0;
	
    this.configInfo = ci;
    
    this.deviceList = [];

    var getDevices = function() {
        telldus.getDevices(function (devices) {
            var i = 0;
    
            console.log ("Devices ", devices);
        
            for (i=0; i < devices.length; i = i + 1) {
		switch(devices[i].model) {
		    default:
			self.deviceList.push({ name: devices[i].name,
					       object: switchDev.create(telldus,devices[i])});
			break;
		}
            };
        });
    };
	

    /**
     * @function publishAdminInfo
     * 
     * @param {function} callback
     * @returns {undefined}
     */
    this.publishAdminInfo = function(callback) {
        var utc = Math.floor((new Date())/1000);
        var nodeId = 0;
        var nodeName = "";
	var i;
	
        for (i=0; i < self.deviceList.length; i=i+1) {
            self.deviceList[i].object.getMqttMessages(function(err,topicJson,msgJson) {
                    if (!err) {
                        callback(null,topicJson,msgJson);
                    } else {
                        
                    }
            });
        }
    };

    this.publishInfo = function(deviceNameStr,callback) {
        
    };

    this.getDeviceData = function (callback) {
        callback(null);
    };
    
    this.setDeviceData = function(deviceName, deviceValue) {
        var deviceId = -1;
        var i = 0;
        
        (function getNodePtr(nodeIndex,deviceName, callback) {
            if (nodeIndex > 0) {
                if (self.deviceList[nodeIndex-1].name === deviceName) {
                    callback(nodeIndex-1);
                } else {
                    getNodePtr(nodeIndex-1, deviceName, callback);
                }
            } else {
                callback(null);
            }
        })(self.deviceList.length, 
           deviceName,
            function(nodePtr) {
                var accessMethod = "";
                
                
                if (nodePtr !== null) {
                    self.deviceList[nodePtr].object.setDevData(deviceValue,5,function(err) {
                            if (err) {
                                console.log("NodeTelstick: SetDeviceData err=",err);
                            }
                        });
                } else {
                    console.log("NodeTelstick: SetDeviceData: Error: " + deviceName + " is not known");
                }
            });
    };
    
    this.getDeviceInfo = function() {
		
    };

    (function setup() {
	    getDevices();
        })();
	

};

// Functions which will be available to external callers
exports.create = function(ci) {
    return new nodeTellstick(ci);
};
