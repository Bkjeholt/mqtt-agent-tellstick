/************************************************************************
 Product    : Home information and control
 Date       : 2017-01-31
 Copyright  : Copyright (C) 2017 Kjeholt Engineering. All rights reserved.
 Contact    : dev@kjeholt.se
 Url        : http://www-dev.kjeholt.se
 Licence    : ---
 ---------------------------------------------------------
 File       : mqtt-agent-tellstick/js/classes/nodes/basic.js
 Version    : 0.1.1
 Author     : Bjorn Kjeholt
 ---------------------------------------------------------
 
 *************************************************************************/

exports.generateMqttInfoMessages = function(devInfo, callback) {
    var utc = Math.floor((new Date())/1000);
    callback( null,
              { order: "info_present",
                node: devInfo.name },
              { time: utc,
                date: new Date(),
                name: devInfo.name,
                rev: "1.0.0",
                type: "TellstickDevice" } );
                                          
    callback( null,
              { order: "info_present",
                node: devInfo.name,
                device: "level" },
              { time: utc,
                date: new Date(),
                name: "level",
                rev:"---",
                datatype: "int",
                devicetype: "semistatic",
                outvar: 1 } );

    callback( null,
              { order: "info_present",
                node: devInfo.name,
                device: "config"},
              { time: utc,
                date: new Date(),
                name: "config",
                rev:"---",
                datatype: "text",
                devicetype: "static",
                outvar: 1 } );

    callback( null,
              { order: "data_request",
                node: devInfo.name,
                device: "config"},
              { time: utc,
                date: new Date() } );

};

exports.generateMqttDataMessages = function(devInfo, devData, callback) {
    var utc = Math.floor((new Date())/1000);
               
    callback( null,
              { order: "data_request",
                node: devInfo.name,
                device: "config" },
              { time: utc,
                date: new Date(),
                data: JSON.stringify(devData) } );
};
