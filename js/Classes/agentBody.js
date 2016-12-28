/************************************************************************
 Product    : Home information and control
 Date       : 2016-11-26
 Copyright  : Copyright (C) 2016 Kjeholt Engineering. All rights reserved.
 Contact    : dev@kjeholt.se
 Url        : http://www-dev.kjeholt.se
 Licence    : ---
 ---------------------------------------------------------
 File       : mqtt-agent-ovpn/Classes/agentBody.js
 Version    : 0.2.1
 Author     : Bjorn Kjeholt
 *************************************************************************/

var mqtt = require('mqtt');
var nodeClass = require('./nodeTellstick');
var fs = require('fs');

agentBody = function(ci) {
    var self = this;
  
    this.ci = ci;

    this.mqttConnected = false;
    this.gateWayReady = false;
    
//    this.nodeClient = nodeClass.create_nodeTellstick(ci);
    
    console.log("MQTT connect :");

    this.topicStrToJson = function (str) {
        var t = str.split("/");
        var result = {group: t[0],
                       order: t[1],
                       agent: '---',
                       node: '---',
                       device: '---',
                       variable: '---' };
        
        if (t[2] !== undefined) { 
            result.agent = t[2];
        
            if (t[3] !== undefined) {
                result.node = t[3];
        
                if (t[4] !== undefined) { 
                    result.device = t[4];
        
                    if (t[5] !== undefined) 
                        result.variable = t[5];
                }
            }
        }
        
        return result;
    };
    
  
    this.mqttSubscribe = function() {
        var i = 0;
        
        for (i=0; i < self.ci.mqtt.subscriptions.length; i=i+1) {
            console.log("MQTT subscribe: ", self.ci.mqtt.subscriptions[i]);
            self.mqttClient.subscribe(self.ci.mqtt.subscriptions[i]);
        }
    };
        
    this.mqttConnect = function(connack) {
//        console.log("MQTT connected :",connack);
        self.ci.mqtt.connected = true;
        self.mqttSubscribe();
        self.publishInfo();
    };

    this.mqttDisconnect = function () {
        self.mqttConnected = false;
        self.ci.mqtt.connected = false;
        
    };
    
    this.mqttError = function (error) {
        self.mqttConnected = false;
        self.ci.mqtt.connected = false;
        console.log("MQTT Error = ",error);
    };
    

    this.mqttSubscribedMessage = function(topicStr, messageStr, packet) {
        var topic = self.topicStrToJson(topicStr);
        var payload = JSON.parse(messageStr);
        var currTime = Math.floor((new Date())/1000);
        var fileNameArray;
        var i;
        var fd;
        var certBuffer;

        switch (topic.group + "/" + topic.order) {
            case 'data/set':
                if (topic.node === 'admin') {
                    switch (topic.device) {
                        case 'no_of_devices':
                            /*
                             * topic: data/set/"Agent_name"/admin/no_of_devices
                             */
                                
                            self.nodeClient.requestAdminDeviceInfo(payload.data, 
                                                                       function(err,topicStr, msgStr) {
                                            if (!err) {
                                                self.mqttClient.publish(topicStr,msgStr, { qos:0, retain: 1 });
                                            } else {
                                                console.log("Error");
                                            }
                                        });
                            break;
                        default:
                            switch (topic.variable) {
                                case 'config':
                                    self.nodeClient.setDeviceConfig(topic.device,payload.data);
                                    break;
                                case 'name':
                                    self.nodeClient.setDeviceName(topic.device,payload.data);
                                    break;
                                default:
                                    break;
                            };
                            break;
                        }
                    
                } else {
                    
                }
                switch (topic.node) {
                    case 'admin':
                        break;
                    default:
                        switch (topic.device) {
                            case 'config' :
                                break;
                            default:
                                break;
                        }
                        break;
                }
                break;
            default:
                break;
        };
      
        self.nodeClient.getDeviceData(wanIPaddr, function(err,devData) {
            if (!err) {
                self.mqttClient.publish("data/present/"+self.ci.agent.name+"/"+devData.node+"/"+devData.device,
                                        { time: Math.floor((new Date())/1000),
                                          date: new Date(),
                                          data: devData.value });
            }
        });        
    };

    this.publishInfo = function () {
        var utc = Math.floor((new Date())/1000);
        var i;
        var fileNameArray;

        self.nodeClient.publishAdminInfo(function(err,topicStr,msgStr) {
            if (!err) {
                self.mqttClient.publish(topicStr,msgStr,{ qos: 0, retain: 1 });
            }
        });
    };
    
    (function setup (ci) {
        (function mqttSetup (ci) {
            self.mqttClient = mqtt.connect("mqtt://"+ci.mqtt.ip_addr,
                                           { connectTimeout: 5000 });
            self.mqttClient.on('close',(self.mqttDisconnect));
            self.mqttClient.on('connect',(self.mqttConnect));
            self.mqttClient.on('error',(self.mqttError));
            self.mqttClient.on('message',(self.mqttSubscribedMessage));
        }(ci));
        
        (function nodeSetup (ci) {
            self.nodeClient = nodeClass.create_node(ci); 
        })(ci);    
  
    })(this.ci);
    
};

exports.create = function (ci) {
    return new agentBody(ci);
};




