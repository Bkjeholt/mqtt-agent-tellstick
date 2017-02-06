/************************************************************************
 Product    : Home information and control
 Date       : 2017-02-05
 Copyright  : Copyright (C) 2017 Kjeholt Engineering. All rights reserved.
 Contact    : dev@kjeholt.se
 Url        : http://www-dev.kjeholt.se
 Licence    : ---
 ---------------------------------------------------------
 File       : mqtt-agent-ovpn/nodes/switch.js
 Version    : 0.1.2
 Author     : Bjorn Kjeholt
 ---------------------------------------------------------

 *************************************************************************/
 
var nodeBasics = require('./basics');

var switchDev = function(tdAccess,deviceInfo) {
    var td = tdAccess;
    var devInfo = deviceInfo;
     
    var self = this;
     
    this.getDevInfo = function (callback) {
        callback(null,devInfo);
    };

    /**
     * 
     * @param {int} value
     * @param {int} noOfRepeats
     * @param {function} callback
     * @returns {undefined}
     */
    this.setDevData = function(value,noOfRepeats,callback) {
         if (noOfRepeats > 0) {
             if (value > 0) {
                 td.turnOn(devInfo.id,function(err) {
                         if (! err) {
                             self.setDevData(value,noOfRepeats-1,callback);
                         } else {
                             callback({error: "Fault during switch on device no=" + devInfo.id,
                                       info: {dev_id: devInfo.id,
                                              dev_info: devInfo,
                                              dev_value: value,
                                              repeats: noOfRepeats,
                                              response: err }});
                         }
                     });
             } else {
                 td.turnOff(devInfo.id,function(err) {
                         if (! err) {
                             self.setDevData(value,noOfRepeats-1,callback);
                         } else {
                             callback({error: "Fault during switch off device no=" + devInfo.id,
                                       info: {dev_id: devInfo.id,
                                              dev_info: devInfo,
                                              dev_value: value,
                                              repeats: noOfRepeats,
                                              response: err }});
                         }
                     });
             }
         } else {
             callback(null);
         }
    };
     
    this.getMqttMessages = function(callback) {
         nodeBasics.generateMqttInfoMessages(devInfo,callback);
         nodeBasics.generateMqttDataMessages(devInfo,devInfo,callback);
      
     };
 };
 
 exports.create = function(tdAccess,deviceInfo) {
    return new switchDev(tdAccess,deviceInfo);
};
