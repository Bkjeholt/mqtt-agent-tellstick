/************************************************************************
 Product    : Home information and control
 Date       : 2016-08-22
 Copyright  : Copyright (C) 2016 Kjeholt Engineering. All rights reserved.
 Contact    : dev@kjeholt.se
 Url        : http://www-dev.kjeholt.se
 Licence    : ---
 ---------------------------------------------------------
 File       : mqtt-agent-ovpn/nodeOpenVPN.js
 Version    : 0.1.0
 Author     : Bjorn Kjeholt
 ---------------------------------------------------------
 Data struct: [
		 {name: ”ovpn-test-cert-34”,
		  devices: [
			{ name: ”e-post”,
			  dat: ”text”,
			  det: ”semistatic”,
			  value: ”” },
			{ name: ”certificate”,
			  dat: ”text”,
			  det: ”semistatic”,
			  value: ”” }
			    ]}
	       ]


 *************************************************************************/

var fs = require('fs');

var nodeOpenVPN = function(ci) {
    var self = this;
    
    this.configInfo = ci;
    console.log("ConfigInfo", ci);
    
    this.nodeInfoList = [];

/*    
    this.updateDeviceData = function (certificateName,deviceName,value) {
        var ni=0;
        
        for (ni=0; ni < self.nodeInfoList.length; ni=ni+1) {
            process.nextTick((function (nodeInfo) {
                switch (deviceName) {
                    case 'active':
                        nodeInfo.device.active = value;
                        break;
                    case 'e-mail-addr':
                        nodeInfo.device.eMailAddr = value;
                        break;
                    case 'wan-ip-addr':
                        nodeInfo.device.wanIPaddr = value;
                        break;
                    default:
                        break;
                };
                
                var di=0;
                if (certificateName === nodeInfo.name) {
                    for (di=0; di < nodeInfo.devices.length; di=di+1) {
                        if (deviceName === nodeInfo.devices[di].name) {                        
                            nodeInfo.devices[di].value = value;
                        }
                    }
                }
            })(self.nodeInfoList[ni]));
        }
    };
    
*/
    this.getDeviceInfo = function (callback) {
  	var fileNameArray = "";
	var i = 0;

	var certificateName;
	
        fileNameArray = fs.readdirSync(self.configInfo.ovpn.local_path+'/private');
        
        for (i=0; i < fileNameArray.length; i = i+1) {
            if ((fileNameArray[i].endsWith('.key')) && (fileNameArray[i].startsWith('ovpn'))) {
		/*
		 * Search if the node already is known
		 */
							  
		certificateName = fileNameArray[i].slice(0,fileNameArray[i].search('.key'));
	
                process.nextTick(function () {
                    var ni=0;
                    var alreadyKnown = false;
                    
                    for (ni = 0; ni < self.nodeInfoList.length; ni = ni + 1) {
                        if (self.nodeInfoList[ni].name === certificateName)
                            alreadyKnown = true;
                    }
                    
                    if (!alreadyKnown) {
                        self.nodeInfoList.push({ name: certificateName,
                                            devData:  { active: '0',
                                                       eMailAddr: '',
                                                       certificate: '',
                                                       wanIPaddr: '127.0.0.1' },
                                            publishedDevData:  { active: '-',
                                                                 eMailAddr: '-',
                                                                 certificate: '-',
                                                                 wanIPaddr: '127.0.0.1' } });
                        callback(null,{ type: 'declare-node',
                                        nodeName: certificateName,
                                        nodeRev: '0.1.0',
                                        nodeType: 'OpenVPN-certificate' });
                        callback(null,{ type: 'declare-device',
                                        nodeName: certificateName,
                                        deviceName: 'active',
                                        dat: 'bool',
                                        det: 'semistatic' });
                        callback(null,{ type: 'declare-device',
                                        nodeName: certificateName,
                                        deviceName: 'e-mail-addr',
                                        dat: 'text',
                                        det: 'semistatic' });                                    
                        callback(null,{ type: 'declare-device',
                                        nodeName: certificateName,
                                        deviceName: 'wan-ip-addr',
                                        dat: 'text',
                                        det: 'semistatic' });                                    
                    }
                    
                });							
            }
	}      
    };
    
    this.getDeviceData = function (wanIPaddr, callback) {
        var ni=0;
        var di=0;
        
        for (ni=0; ni < self.nodeInfoList.length; ni=ni+1) {
            process.nextTick(function() {
                var send_e_mail = 0;
                var nodeName = self.nodeInfoList[ni].name;
                
                if (self.nodeInfoList[ni].devData.active !== self.nodeInfoList[ni].publishedDevData.active) {
                    self.nodeInfoList[ni].publishedDevData.active = self.nodeInfoList[ni].devData.active;

                    send_e_mail = 1;
                    callback(null, { type: 'publish-devdata',
                                     node: nodeName,
                                     device: 'active',
                                     value: nodeName.devData.active });
                }
                if (self.nodeInfoList[ni].devData.eMailAddr !== self.nodeInfoList[ni].publishedDevData.eMailAddr) {
                    self.nodeInfoList[ni].publishedDevData.eMailAddr = self.nodeInfoList[ni].devData.eMailAddr;

                    send_e_mail = 1;

                    callback(null, { type: 'publish-devdata',
                                     node: nodeName,
                                     device: 'e-mail-addr',
                                     value: nodeName.devData.eMailAddr });
                }
                if (self.nodeInfoList[ni].devData.wanIPaddr !== self.nodeInfoList[ni].publishedDevData.wanIPaddr) {
                    self.nodeInfoList[ni].publishedDevData.wanIPaddr = self.nodeInfoList[ni].devData.wanIPaddr;

                    send_e_mail = 1;

                    callback(null, { type: 'publish-devdata',
                                     node: nodeName,
                                     device: 'wan-ip-addr',
                                     value: nodeName.devData.wanIPaddr });
                }
                
                if (send_e_mail > 0) {
                    process.nextTick(function () {
                        var nodeInfo = self.nodeInfoList[ni];
                        var msgBodyText = 'The certificate is regenerated due to changes in the preconditions';
                        var msgBodyHttp = '';
                        var msgAttachment = [];
                        var filePath = self.configInfo.ovpn.local_path + 'private/' + nodeInfo.name + '.key';
                        var certKey = fs.readFileSync(filePath);
                        msgAttachment.push({
                            filename: (nodeInfo.name+'.ovpn'),
                            contentType: 'text/plain',
                            content: ('Header\n'+nodeInfo.devData.wanIPaddr+'\n'+certKey) });
                        
                        callback(null, { type: 'publish-email',
                                         addr: nodeName.devData.eMailAddr,
                                         subject: 'Updated certificate',
                                         body: { text: msgBodyText },
                                         attachment: msgAttachment });
                    });
                }
                callback(null,{ type: ''});
                if (nodeName.active) {
                    callback(null, {
                       topic: {
                           addr: nodeName.devices.eMailAddr,
                           subject: nodeName.devices.subject
                       },
                       body: {
                           
                       }
                    });
                }
            });
            for (di=0; di < self.nodeInfoList[ni].devices.length; di=di+1) {
                process.nextTick(function () {
                    var value;
                    var nodeInfo = self.nodeInfoList[ni];
                    var deviceInfo = self.nodeInfoList[ni].devices[di];
                    switch (deviceInfo.name) {
                        case 'e-mail' :
                        case 'active' :
                            value = deviceInfo.value;
                            break;
                        case 'certificate' :
                        default:
                    };
                    
                    if ((value !== deviceInfo.value) || (deviceInfo.det === 'dynamic')) {
                        deviceInfo.lastReadValue = value;
                        
                        callback(null, { node: nodeInfo.name,
                                         device: deviceInfo.name,
                                         value: value });
                    }
                });
            }
        }
        
    };
};

exports.create_node = function (ci) {
	  return new nodeOpenVPN(ci);
};