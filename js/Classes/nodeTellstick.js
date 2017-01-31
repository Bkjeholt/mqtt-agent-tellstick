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

var jtelldus = require('jontelldus');

var dimDev = require('nodes/dim');
var switchDev = require('nodes/switch');

var nodeTellstick = function (ci) {
    var self = this;
	
    this.nodeInfo = [];
    
    this.actionQueue = [];
    this.ongoingActionScan = 0;
	
    this.configInfo = ci;
    
    this.deviceList = [];

    var getDevices = function() {
        jtelldus.getDevices(function (devices) {
            var i = 0;
    
            console.log ("Devices ", devices);
        
            for (i=0; i < devices.length; i = i + 1) {
		switch(devices[i].model) {
		    default:
			self.deviceList.push({ name: devices[i].name,
					       object: switchDev.create(jtelldus,devices[i])});
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
			  
	callback(null,
                 "info/present/" + self.configInfo.agent.name,
                 JSON.stringify({  time: utc,
                                   date: new Date(),
                                   name: self.configInfo.agent.name,
                                   rev:  self.configInfo.agent.ver }));
			
        callback(null,
                 "info/present/" + self.configInfo.agent.name + "/admin",
                 JSON.stringify({ time: utc,
                                  date: new Date(),
                                  name: "admin",
                                  rev: "1.0.0",
                                  type: "AdminInfo" }));
			
        callback(null,
                 "info/present/" + self.configInfo.agent.name + "/admin/no_of_devices",
                 JSON.stringify({ time: utc,
                                  date: new Date(),
                                  name: "no_of_devices",
                                  rev:"---",
                                  datatype: "int",
                                  devicetype: "semistatic",
                                  outvar: 1 }));

        /*
         * present info about all known nodes/devices
         */
        
        for (nodeId=0; nodeId < self.nodeInfo.length; nodeId = nodeId + 1) {
            nodeName = "dev-" + nodeId + "";
            
            callback(null,
                     "info/present/" + self.configInfo.agent.name + "/admin/" + nodeName + "",
                         JSON.stringify({ time: utc,
                                          date: new Date(),
                                          name: nodeName,
                                          rev: "1.0.0",
                                          type: "AdminInfo" }));
                                          
            callback(null,
                         "info/present/" + self.configInfo.agent.name + "/admin/" + nodeName + "/name",
                         JSON.stringify({ time: utc,
                                          date: new Date(),
                                          name: "name",
                                          rev:"---",
                                          datatype: "text",
                                          devicetype: "semistatic",
                                          outvar: 1 }));
            callback(null,"info/present/" + self.configInfo.agent.name + "/admin/" + nodeName + "/config",
                         JSON.stringify({ time: utc,
                                          date: new Date(),
                                          name: "config",
                                          rev:"---",
                                          datatype: "text",
                                          devicetype: "semistatic",
                                          outvar: 1 }));

            callback(null,
                     "info/present/" + self.configInfo.agent.name + "/" + self.nodeInfo[nodeId].name + "",
                         JSON.stringify({ time: utc,
                                          date: new Date(),
                                          name: nodeName,
                                          rev: "1.0.0",
                                          type: "TellstickDevice" }));
                                          

            callback(null,
                         "info/present/" + self.configInfo.agent.name + "/" + self.nodeInfo[nodeId].name + "/level",
                         JSON.stringify({ time: utc,
                                          date: new Date(),
                                          name: "level",
                                          rev:"---",
                                          datatype: "int",
                                          devicetype: "semistatic",
                                          outvar: 1 }));
            callback(null,
                     "data/request/" + self.configInfo.agent.name + "/" + self.nodeInfo[nodeId].name + "/level",
                     JSON.stringify({ date: new Date() }));
            
        }
        
        callback(null,
                 "data/request/" + self.configInfo.agent.name + "/admin/no_of_devices",
                 JSON.stringify({ date: new Date() }));

    };

    this.publishInfo = function(deviceNameStr,callback) {
        
    };
    
    this.requestAdminDeviceInfo = function (noOfDevices,callback) {
        var utc = Math.floor((new Date())/1000);
        
	(function requestDeviceInfo(deviceId){
            var deviceName = "dev-"  + (deviceId) + "";
                        
            if (deviceId > 0) {
                callback(null,
                         "info/present/" + self.configInfo.agent.name + "/admin/" + deviceName + "",
                         JSON.stringify({ time: utc,
                                          date: new Date(),
                                          name: deviceName,
                                          rev: "1.0.0",
                                          type: "AdminInfo" }));
                                          
                callback(null,
                         "info/present/" + self.configInfo.agent.name + "/admin/" + deviceName + "/name",
                         JSON.stringify({ time: utc,
                                          date: new Date(),
                                          name: "name",
                                          rev:"---",
                                          datatype: "text",
                                          devicetype: "semistatic",
                                          outvar: 1 }));
                callback(null,"info/present/" + self.configInfo.agent.name + "/admin/" + deviceName + "/config",
                         JSON.stringify({ time: utc,
                                          date: new Date(),
                                          name: "config",
                                          rev:"---",
                                          datatype: "text",
                                          devicetype: "semistatic",
                                          outvar: 1 }));
                            
                callback(null,"data/request/" + self.configInfo.agent.name + "/" + deviceName + "/name",
                         JSON.stringify({ date: new Date() }));
                callback(null,"data/request/" + self.configInfo.agent.name + "/" + deviceName + "/config",
                         JSON.stringify({ date: new Date() }));
                         
                self.nodeInfo.push({ admin: { dev_id: deviceId,
                                              dev_name: deviceName,
                                              config: "" },
                                     name: "",
                                     level: 0.0,
                                     datatype: "float",
                                     devicetype: "semistatic" });
                         
                requestDeviceInfo(deviceId - 1);
            } else {
            }
        })(noOfDevices);
    };

    /**
     * 
     * @param {type} deviceNameStr
     * @param {type} configStr
     * @returns {undefined}
     */
    this.setDeviceConfig = function(deviceNameStr, configStr) {
        (function getDevicePtr(index, callback) {
            if (index > 0) {
                if (self.nodeInfo[index-1].dev_name === deviceNameStr) {
                    callback(index);
                } else {
                    getDevicePtr(index-1, callback);
                } 
            } else {
                callback(null);
            }
        })(self.nodeInfo.length, function (ptr) {
            if (!ptr) {
                self.nodeInfo[ptr].admin.config = JSON.parse(configStr);
            }
        });
    };

    /**
     * 
     * @param {String} deviceNameStr
     * @param {String} nameStr
     * @param {function} callback
     * @returns {undefined}
     */
    this.setDeviceName = function(deviceNameStr, nameStr, callback) {
        (function getDevicePtr(index, callback) {
            if (index > 0) {
                if (self.nodeInfo[index-1].dev_name === deviceNameStr) {
                    callback(index);
                } else {
                    getDevicePtr(index-1, callback);
                } 
            } else {
                callback(null);
            }
        })(self.nodeInfo.length, function (ptr) {
            var utc = 0;
            
            if (!ptr) {
                self.nodeInfo[ptr].name = nameStr;
                
                callback(null,
                         "info/present/" + self.configInfo.agent.name + "/" + nameStr + "",
                         JSON.stringify({ time: utc,
                                          date: new Date(),
                                          name: nameStr,
                                          rev: "---",
                                          type: "DeviceInfo" }));
                                          
                callback(null,
                         "info/present/" + self.configInfo.agent.name + "/" + nameStr + "/name",
                         JSON.stringify({ time: utc,
                                          date: new Date(),
                                          name: "name",
                                          rev:"---",
                                          datatype: "text",
                                          devicetype: "semistatic",
                                          outvar: 1 }));
                callback(null,
                         "info/present/" + self.configInfo.agent.name + "/" + nameStr + "/level",
                         JSON.stringify({ time: utc,
                                          date: new Date(),
                                          name: "level",
                                          rev:"---",
                                          datatype: "int",
                                          devicetype: "semistatic",
                                          outvar: 1 }));
                callback(null,
                         "data/present/" + self.configInfo.agent.name + "/" + nameStr + "/name",
                         JSON.stringify({ time: utc,
                                          date: new Date(),
                                          name: nameStr }));

                callback(null,
                         "data/request/" + self.configInfo.agent.name + "/" + nameStr + "/level",
                         JSON.stringify({ time: utc }));

            }
        });
        
    };

    this.setDeviceData = function(nodeName, deviceValue) {
        var deviceId = -1;
        var i = 0;
        
        (function getNodePtr(nodeIndex,nodeName, callback) {
            if (nodeIndex > 0) {
                if (self.nodeInfo[nodeIndex-1].name === nodeName) {
                    callback(nodeIndex-1);
                } else {
                    getNodePtr(nodeIndex-1, nodeName, callback);
                }
            } else {
                callback(null);
            }
        })(self.nodeInfo.length, 
           nodeName,
            function(nodePtr) {
                var accessMethod = "";
                
                
                if (nodePtr !== null) {
                    if (deviceValue === 0)
                        accessMethod = "Off";
                    else if (deviceValue < 100)
                        accessMethod = "Dim";
                    else
                        accessMethod = "On";
                    
                    (function createActionEntries(execTime, retries,delay) {
                            if (retries > 0) {
                                self.actionQueue.push({ device_id: self.nodeInfo[nodePtr].admin.config.id,
                                                        time: execTime,
                                                        value: deviceValue,
                                                        method: accessMethod });
                                createActionEntries(execTime+delay,retries-1,delay);
                            }    
                        })(Math.floor((new Date())/1000),5,2);
                    self.actionQueue.sort(function(a,b) { return a.time - b.time; });
                } else {
                    console.log("setDeviceData: Error " + nodeName + " is not known");
                }
            });
    };
    
	this.getDeviceInfo = function() {
		
	};
        
        this.emptyActionQueue = function (callback) {
            var action;
            var currTime = Math.floor((new Date())/1000);
            
            if (self.actionQueue.length > 0) {
                if (self.actionQueue[0].time <= currTime) {
                    action = self.actionQueue.shift();
                
                    switch (action.method) {
                        case 'On':
                            jtelldus.turnOn(action.device_id,
                                            function(err) {
                                                if (!err) {
                                                    self.emptyActionQueue(callback);
                                                } else {
                                                    callback({ code: "Failing Telldus TurnOn",
                                                               error: err });
                                                }
                                            });
                            break;
                        case 'Off':
                            jtelldus.turnOff(action.device_id,
                                            function(err) {
                                                if (!err) {
                                                    self.emptyActionQueue(callback);
                                                } else {
                                                    callback({ code: "Failing Telldus TurnOff",
                                                               error: err });
                                                }
                                            });
                            break;
                        case 'Dim':
                            jtelldus.dim(   action.device_id,
                                            action.value,
                                            function(err) {
                                                if (!err) {
                                                    self.emptyActionQueue(callback);
                                                } else {
                                                    callback({ code: "Failing Telldus dim",
                                                               error: err });
                                                }
                                            });
                            break;
                        default:
                            callback({ code: "Unknown telldus access method" + action.method + "",
                                       error: "---" });
                            break;
                    }
                } else {
                    callback(null);
                }
            } else {
                /*
                 * The action queue is empty
                 */
                
                callback(null);
            }
        };
    setInterval(function () {
        if (self.ongoingActionScan === 0) {
            self.ongoingActionScan = Math.floor((new Date())/1000);
        
            self.emptyActionQueue(function(err) {
                    self.ongoingActionScan = 0;
                    if (err) {
                        console.log("Scan and empty action queue error: ", err);
                    } });
            }},1000);

    (function setup() {
	    getDevices();
        })();
	

};

// Functions which will be available to external callers
exports.create = function(ci) {
    return new nodeTellstick(ci);
};
