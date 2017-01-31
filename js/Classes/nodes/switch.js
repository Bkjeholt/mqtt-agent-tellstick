/************************************************************************
 Product    : Home information and control
 Date       : 2017-01-30
 Copyright  : Copyright (C) 2017 Kjeholt Engineering. All rights reserved.
 Contact    : dev@kjeholt.se
 Url        : http://www-dev.kjeholt.se
 Licence    : ---
 ---------------------------------------------------------
 File       : mqtt-agent-ovpn/nodes/switch.js
 Version    : 0.1.1
 Author     : Bjorn Kjeholt
 ---------------------------------------------------------

 *************************************************************************/
 
 var switch = function(tdAccess,deviceInfo,configInfo) {
     var td = tdAccess;
     var devInfo = deviceInfo;
     var ci = configInfo;
     
     var self = this;
     
     this.getDevInfo = function (callback) {
         callback(null,devInfo);
     };
     
     this.setDevData = function(devId,value,noOfRepeats,callback) {
         if (noOfRepeats > 0) {
             if (value > 0) {
                 td.turnOn(devId,function(err) {
                         if (! err) {
                             self.setValue(devId,value,noOfRepeats-1,callback);
                         } else {
                             callback({error: "Fault during switch on device no=" + devId,
                                       info: {dev_id: devId,
                                              dev_value: value,
                                              repeats: noOfRepeats,
                                              response: err }});
                         }
                     });
             } else {
                 td.turnOff(devId,function(err) {
                         if (! err) {
                             self.setValue(devId,value,noOfRepeats-1,callback);
                         } else {
                             callback({error: "Fault during switch off device no=" + devId,
                                       info: {dev_id: devId,
                                              dev_value: value,
                                              repeats: noOfRepeats,
                                              response: err }});
                         }
                     });
             }
         } else {
             callback(null);
         }
     }
 };
 
 exports.create = function(tdAccess,deviceInfo) {
    return new switch(tdAccess,deviceInfo);
};
