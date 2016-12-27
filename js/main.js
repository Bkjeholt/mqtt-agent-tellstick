/************************************************************************
 Product    : Home information and control
 Date       : 2016-05-25
 Copyright  : Copyright (C) 2016 Kjeholt Engineering. All rights reserved.
 Contact    : dev@kjeholt.se
 Url        : http://www-dev.kjeholt.se
 Licence    : ---
 -------------------------------------------------------------------------
 File       : MqttAgentRPi/main.js
 Version    : 0.1.1
 Author     : Bjorn Kjeholt
 -------------------------------------------------------------------------
 MQTT file structure:
              agent: Defined via the docker run command
              node: "admin"
                   device: "no_of_devices"
                           "dev-x" There x is an incremental number from 1.
                                 variable: "name"
                                           "config"
              
              
            
 *************************************************************************/
/*
 
var jtelldus = require('jontelldus');

var device = {
  name: "Utebelysning",
  model: "selflearning-switch",
  protocol: "arctech",
  parameters: {
    house: 17448710,
    unit: 1
  }
};

jtelldus.getDevices(function (devices) {
  console.log("Available tellstick devices:", devices);
});

var value101 = 0;
var value201 = 0;

setInterval(function() {
    // Get time of the day
    var date = new Date();
    var timeOfTheDay = date.getHours() + (date.getMinutes()/60.0) + 1.0;
    
    console.log("Current time=" + timeOfTheDay);
  
    if (((timeOfTheDay > 5.5)&&(timeOfTheDay<7.5)) || ((timeOfTheDay>16.0)&&(timeOfTheDay<21.50))) { 
        if (value201 > 0) {
            jtelldus.turnOn(201,function(err) { 
                                    if (err) console.log("TurnOn 201 error", err); });
            value201 = value - 1;
        } 
    } else
        { 
            jtelldus.turnOff(201,function(err) 
                                    { if (err) console.log("TurnOff 201 error", err); });
//            jtelldus.turnOff(101,function(err) 
//                                    { if (err) console.log("TurnOff 101 error", err); });
        }    
},10000);

return;
*/
var agent = require('./Classes/agentBody');

var agentObj = agent.create_AgentBody({ 
                                    agent: {
                                            name: process.env.npm_package_name,
                                            rev:  process.env.npm_package_version },
                                    mqtt: {
                                            ip_addr: (process.env.MQTT_IP_ADDR !== undefined)? process.env.MQTT_IP_ADDR : process.env.MQTT_PORT_1883_TCP_ADDR,   // "192.168.1.10",
                                            port_no: (process.env.MQTT_PORT_NO !== undefined)? process.env.MQTT_PORT_NO : process.env.MQTT_PORT_1883_TCP_PORT,   // "1883",
                                            user:    (process.env.MQTT_USER !== undefined)? process.env.MQTT_USER : process.env.MQTT_ENV_MQTT_USER,      //"hic_nw",
                                            passw:   (process.env.MQTT_PASSWORD !== undefined)? process.env.MQTT_PASSWORD : process.env.MQTT_ENV_MQTT_PASSWORD,  //"RtG75df-4Ge",
                                            connected: false,
                                            link: { 
                                                    status: 'down',
                                                    latest_status_time: (Math.floor((new Date())/1000)),
                                                    timeout: 120 }, // seconds
                                            subscriptions: [
                                                    "data/set/" + process.env.npm_package_name + "/#"
                                            ]
                                          },
                                    node: {
                                            scan_node_data: 30000,
                                            scan_new_nodes: 300000 }
                                  });
var cnt= 0;

setInterval(function() {
    console.log("Status @ " + cnt + "sec. Mqtt link connected:" + agentObj.ci.mqtt.connected);
    cnt = cnt + 10;
},10000);
//abhObj.setup();

