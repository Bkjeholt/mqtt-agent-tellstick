/************************************************************************
 Product    : Home information and control
 Date       : 2017-02-02
 Copyright  : Copyright (C) 2107 Kjeholt Engineering. All rights reserved.
 Contact    : dev@kjeholt.se
 Url        : http://www-dev.kjeholt.se
 Licence    : ---
 ---------------------------------------------------------
 File       : mqtt-agent-tellstick/js/Classes/support/mqttBasics.js
 Version    : 0.1.1
 Author     : Bjorn Kjeholt
 *************************************************************************/

exports.topicStrToJson = function (str, callback) {
        var t = str.split("/");
        var result = {group: '---',
                       order: '---',
                       agent: '---',
                       node: '---',
                       device: '---',
                       variable: '---' };
        
        if (t.length > 1) {
            result.group = t[0];
            result.order = t[1];
        
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
            callback(null,result);
        } else {
            // The topic doesn't contain the required 'group' and 'order' field, skip it!
        }
    };
    
exports.mqttPublish = function(mqttObj, nodeObj, configInfo) {        
    var topicHeaderStr = { info_present: "info/present/" + self.ci.agent.name,
                           data_request: "data/request/" + self.ci.agent.name };
        
    mqttObj.publish( topicHeaderStr.info_present,
                     JSON.stringify({
                                        time: Math.floor((new Date())/1000),
                                        date: new Date(),
                                        name: configInfo.agent.name,
                                        rev: configInfo.agent.rev }),
                     { qos: 0, retain: 1 });
                                
    nodeObj.getNodeInfo(null,function(err,topicJson,msgJson) {
            var topicStr = "";
            var msgStr = "";
            
            if (topicJson.order === "info_present")
                topicStr = topicHeaderStr.info_present;
            else
                topicStr = topicHeaderStr.data_request;
                
            if (!err) {
                if (topicJson.node !== undefined) {
                    topicStr = topicStr + "/" + topicJson.node;
                    msgStr = JSON.stringify(msgJson);
                    
                    if (topicJson.device !== undefined) {
                        topicStr = topicStr + "/" + topicJson.device;
                    
                        if (topicJson.variable !== undefined) {
                            // Create a variable message
                            topicStr = topicStr + "/" + topicJson.variable;
                    
                        }
                    }
                                        
                    mqttObj.publish(topicStr,msgStr,{ qos: 0, retain: 1 });
                }
            } else {
                console.log("AgentBody: Error from getNodeInfo. err=",err);
            }
        });
};
