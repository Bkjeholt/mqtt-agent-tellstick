/************************************************************************
 Product    : Home information and control
 Date       : 2017-01-31
 Copyright  : Copyright (C) 2016-2107 Kjeholt Engineering. All rights reserved.
 Contact    : dev@kjeholt.se
 Url        : http://www-dev.kjeholt.se
 Licence    : ---
 ---------------------------------------------------------
 File       : mqtt-agent-tellstick/js/Classes/agentBody.js
 Version    : 0.3.1
 Author     : Bjorn Kjeholt
 *************************************************************************/

var mqtt = require('mqtt');
var mqttBasics = require('./support/mqttBasics');
var nodeClass = require('./nodeTellstick');
var fs = require('fs');

agentBody = function(ci) {
    var self = this;
  
    this.ci = ci;

    this.mqttConnected = false;
    this.gateWayReady = false;
    
    this.nodeClient = null;
//    this.nodeClient = nodeClass.create_nodeTellstick(ci);
    
    console.log("MQTT connect :");


    this.mqttSubscribedMessage = function(topicStr, messageStr, packet) {
//        var topic;
//        var currTime = Math.floor((new Date())/1000);
//        var fileNameArray;
//        var i;
//        var fd;
//        var certBuffer;

        mqttBasics.topicStrToJson(topicStr, function(err,topicJson) {
                var msgJson = JSON.parse(messageStr);
                switch (topicJson.group + "/" + topicJson.order) {
                    case 'data/set' :
                        if (msgJson.data !== undefined) {
                            self.nodeClient.setDeviceData(topicJson.node,msgJson.data);
                        } else {
                            // Error mal-formatted message
                        }
                        break;
                  
                    default :
                        break;
                }
            });
    };
 
    this.publishInfo = function () {
        var utc = Math.floor((new Date())/1000);
        
        self.mqttClient.publish( "info/present/" + self.ci.agent.name,
                                 JSON.stringify({
                                        time: Math.floor((new Date())/1000),
                                        date: new Date(),
                                        name: self.ci.agent.name,
                                        rev: self.ci.agent.rev }),
                                 { qos: 0, retain: 1 });
                                
        self.nodeClient.getNodeInfo(null,function(err,topicJson,msgJson) {
                var topicStr = (topicJson.order === "info_present")?
                                        "info/present/" + self.ci.agent.name :
                                        "data/request/" + self.ci.agent.name;
                var msgStr = "";
            
                if ((!err) && (topicJson.order !== undefined) && (topicJson.node !== undefined)) {
                    topicStr = topicStr + "/" + topicJson.node;
                    msgStr = JSON.stringify(msgJson);
                    
                    if (topicJson.device !== undefined) {
                        topicStr = topicStr + "/" + topicJson.device;
                    
                        if (topicJson.variable !== undefined) {
                            // Create a variable message
                            topicStr = topicStr + "/" + topicJson.variable;
                    
                        }
                    }
                                        
                    self.mqttClient.publish(topicStr,msgStr,{ qos: 0, retain: 1 });
                } else {
                    console.log("AgentBody: Error from getNodeInfo. error info=",
                                                  { err: err,
                                                    topic_json: topicJson,
                                                    topic_str: topicStr,
                                                    msg_json: msgJson});
                }
            });
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
            self.nodeClient = nodeClass.create(ci); 
        })(ci);    
  
    })(this.ci);
    
};

exports.create = function (ci) {
    return new agentBody(ci);
};




