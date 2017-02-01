/************************************************************************
 Product    : Home information and control
 Date       : 2017-01-31
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
 
 var dimDev = function(tdAccess,deviceInfo) {
     var td = tdAccess;
     var devInfo = deviceInfo;
     
     var self = this;
     
     this.getDevInfo = function (callback) {
         callback(null,devInfo);
     };
     
     this.setDevData = function(value,noOfRepeats,callback) {         
         if (noOfRepeats > 0) {
             td.turnOn(self.devInfo.id,function(err) {
                         if (! err) {
                             self.setDevData(value,noOfRepeats-1,callback);
                         } else {
                             callback({error: "Fault during switch on device no=" + self.devInfo.id,
                                       severity: "warning",
                                       info: {dev_id: self.devInfo.id,
                                              dev_info: self.devInfo,
                                              dev_value: value,
                                              repeats: noOfRepeats,
                                              response: err }});
                         }
                     });
         } else {
             callback(null);
         }
     }
 };
 
 exports.create = function(tdAccess,deviceInfo) {
    return new dimDev(tdAccess,deviceInfo);
};
