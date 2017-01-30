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
     
     this.setValue = function(value) {
         if (value > 0) {
             td.turnOn(1,function(err) {
                 });
         }
     }
 };
 
 exports.create = function(tdAccess,deviceInfo) {
    return new switch(tdAccess,deviceInfo);
};
