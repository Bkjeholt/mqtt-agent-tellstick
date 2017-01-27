/************************************************************************
 Product    : Home information and control
 Date       : 2016-11-26
 Copyright  : Copyright (C) 2016 Kjeholt Engineering. All rights reserved.
 Contact    : dev@kjeholt.se
 Url        : http://www-dev.kjeholt.se
 Licence    : ---
 -------------------------------------------------------------------------
 File       : MqttAgentRPi/main.js
 Version    : 0.2.1
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

var agent = require('./Classes/agentBody');
var http = require('./classes/healthCheck.js');


var configInfo = { agent: {
                                            name: process.env.DOCKER_CONTAINER_NAME,
                                            rev:  process.env.DOCKER_IMAGE_TAG,
                                        docker: {
                                            image: process.env.DOCKER_IMAGE_NAME,
                                            image_tag: process.env.DOCKER_IMAGE_TAG,
                                            container: process.env.DOCKER_CONTAINER_NAME
                                        } },
                   health_check: {
                                        port_no: 3000,
                                        check_functions: [] },
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
                                  };
                                  
var agentObj = agent.create(configInfo);
var healthCheckObj = http.create(configInfo);

var cnt= 0;

setInterval(function() {
    console.log("Status @ " + cnt + "sec. Mqtt link connected:" + agentObj.ci.mqtt.connected);
    cnt = cnt + 15;
},15000);
//abhObj.setup();

