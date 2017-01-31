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
 
 var switch = function(tdAccess,deviceInfo) {
     var td = tdAccess;
     var devInfo = deviceInfo;
     
     var self = this;
     
     this.getDevInfo = function (callback) {
         callback(null,devInfo);
     };
     
   /**
    ** @function
    **/
     this.setDevData = function(value,noOfRepeats,callback) {
         if (noOfRepeats > 0) {
             if (value > 0) {
                 td.turnOn(self.devInfo.id,function(err) {
                         if (! err) {
                             self.setDevData(value,noOfRepeats-1,callback);
                         } else {
                             callback({error: "Fault during switch on device no=" + self.devInfo.id,
                                       info: {dev_id: self.devInfo.id,
                                              dev_info: self.devInfo,
                                              dev_value: value,
                                              repeats: noOfRepeats,
                                              response: err }});
                         }
                     });
             } else {
                 td.turnOff(self.devInfo.id,function(err) {
                         if (! err) {
                             self.setDevData(value,noOfRepeats-1,callback);
                         } else {
                             callback({error: "Fault during switch off device no=" + self.devInfo.id,
                                       info: {dev_id: self.devInfo.id,
                                              dev_info: self.devInfo,
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
     
     this.getMqttInfo = function() {
         var utc = Math.floor((new Date())/1000);
         callback(null,
                  "set_node_info",
                  {       // topic
                      node: self.devInfo.name
                  },
                  {       // message
                      time: utc,
                      date: new Date(),
                      name: self.devInfo.name,
                      rev: "1.0.0",
                      type: "TellstickDevice" }));
                                          
         callback(null,
                  "set_device_info",
                  {       // topic
                      node: self.devInfo.name,
                      device: "level"
                  },
                  {       // message 
                      time: utc,
                      date: new Date(),
                      name: "level",
                      rev:"---",
                      datatype: "int",
                      devicetype: "semistatic",
                      outvar: 1 }));

         callback(null,
                  "set_variable_info",
                  {       // topic
                      node: self.devInfo.name,
                      device: "config",
                      variable: "json"
                  },
                  {       // message 
                      time: utc,
                      date: new Date(),
                      name: "json",
                      rev:"---",
                      datatype: "text",
                      devicetype: "static",
                      outvar: 1 }));

         callback(null,
                  "set_variable_data",
                  { node: self.devInfo.name,
                    device: "config",
                    variable: "json" },
                  { time: utc,
                    date: new Date(),
                    data: JSON.stringify(self.devInfo) }));

     }
 };
 
 exports.create = function(tdAccess,deviceInfo) {
    return new switch(tdAccess,deviceInfo);
};
