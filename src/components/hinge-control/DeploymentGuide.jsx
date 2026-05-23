
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Server, 
  Wifi, 
  Shield, 
  Code, 
  Settings, 
  CheckCircle,
  Copy,
  ExternalLink
} from "lucide-react";

export default function DeploymentGuide({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState("overview");

  if (!isOpen) return null;

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      console.log('Copied to clipboard');
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-gray-900 to-black border border-blue-700/30">
        <CardHeader className="sticky top-0 bg-gradient-to-r from-blue-900/80 to-purple-900/80 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <CardTitle className="text-blue-100 flex items-center gap-2">
              <Server className="w-6 h-6" />
              Production MQTT Deployment Guide
            </CardTitle>
            <Button 
              variant="ghost" 
              onClick={onClose}
              className="text-blue-200 hover:text-white"
            >
              ✕
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-5 w-full mb-6 bg-blue-900/30">
              <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
              <TabsTrigger value="mqtt" className="text-xs">MQTT Setup</TabsTrigger>
              <TabsTrigger value="backend" className="text-xs">Backend</TabsTrigger>
              <TabsTrigger value="device" className="text-xs">Device</TabsTrigger>
              <TabsTrigger value="testing" className="text-xs">Testing</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-blue-100 mb-4">System Architecture</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-purple-900/20 p-4 rounded-lg">
                    <Wifi className="w-8 h-8 text-purple-400 mb-2" />
                    <h4 className="font-semibold text-purple-200">Raspberry Pi</h4>
                    <p className="text-purple-300 text-sm">Edge device with Python agent, GPIO control, camera</p>
                  </div>
                  <div className="bg-blue-900/20 p-4 rounded-lg">
                    <Server className="w-8 h-8 text-blue-400 mb-2" />
                    <h4 className="font-semibold text-blue-200">MQTT Broker</h4>
                    <p className="text-blue-300 text-sm">HiveMQ Cloud, AWS IoT Core, or self-hosted</p>
                  </div>
                  <div className="bg-green-900/20 p-4 rounded-lg">
                    <Shield className="w-8 h-8 text-green-400 mb-2" />
                    <h4 className="font-semibold text-green-200">Base44 App</h4>
                    <p className="text-green-300 text-sm">Web interface with real-time control</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-lg font-semibold text-gray-200">Deployment Checklist</h4>
                <div className="space-y-2">
                  {[
                    "Set up MQTT broker (HiveMQ Cloud recommended)",
                    "Configure backend functions with MQTT credentials",
                    "Flash Raspberry Pi with edge agent code",
                    "Configure device environment variables",
                    "Test device enrollment and commands",
                    "Set up monitoring and alerting"
                  ].map((step, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-gray-300 text-sm">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="mqtt" className="space-y-4">
              <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-blue-100 mb-4">MQTT Broker Setup</h3>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-blue-200 mb-2">Option 1: HiveMQ Cloud (Recommended)</h4>
                    <div className="bg-gray-900/20 rounded p-3">
                      <p className="text-gray-300 text-sm mb-2">Free tier available with TLS support</p>
                      <div className="flex items-center gap-2">
                        <code className="bg-black/30 px-2 py-1 rounded text-xs text-green-400">
                          https://console.hivemq.cloud/
                        </code>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => window.open('https://console.hivemq.cloud/', '_blank')}
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-blue-200 mb-2">Environment Variables Needed</h4>
                    <div className="bg-black/30 rounded p-3 font-mono text-xs space-y-1">
                      <div className="text-green-400">MQTT_HOST=your-broker.hivemq.cloud</div>
                      <div className="text-green-400">MQTT_PORT=8883</div>
                      <div className="text-green-400">MQTT_USERNAME=your_mqtt_user</div>
                      <div className="text-green-400">MQTT_PASSWORD=your_mqtt_password</div>
                      <div className="text-green-400">WEBHOOK_SECRET=your_32_char_secret</div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(`MQTT_HOST=your-broker.hivemq.cloud
MQTT_PORT=8883
MQTT_USERNAME=your_mqtt_user
MQTT_PASSWORD=your_mqtt_password
WEBHOOK_SECRET=your_32_char_secret`)}
                      className="mt-2 text-blue-300"
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      Copy Config
                    </Button>
                  </div>

                  <div>
                    <h4 className="font-semibold text-blue-200 mb-2">MQTT Topics Structure</h4>
                    <div className="bg-black/30 rounded p-3 font-mono text-xs space-y-1">
                      <div><span className="text-purple-400">hinge/cmd/</span><span className="text-yellow-400">{'{deviceId}'}</span> - Commands to device</div>
                      <div><span className="text-blue-400">hinge/evt/</span><span className="text-yellow-400">{'{deviceId}'}</span> - Events from device</div>
                      <div><span className="text-green-400">hinge/state/</span><span className="text-yellow-400">{'{deviceId}'}</span> - Device state (retained)</div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="backend" className="space-y-4">
              <div className="bg-orange-900/20 border border-orange-700/30 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-orange-100 mb-4">
                  <Code className="w-5 h-5 inline mr-2" />
                  Backend Functions Required
                </h3>
                
                <div className="space-y-4">
                  <Badge className="bg-yellow-600/20 text-yellow-200 border-yellow-500/30">
                    ⚠️ These functions need to be implemented outside Base44
                  </Badge>
                  
                  <div className="space-y-4">
                    <div className="bg-black/20 rounded p-4">
                      <h4 className="font-semibold text-orange-200 mb-2">1. Command Publisher Function</h4>
                      <code className="text-sm text-green-400">POST /api/v1/hinges/:id/commands</code>
                      <p className="text-gray-300 text-sm mt-1">Publishes commands to MQTT broker with authentication</p>
                    </div>
                    
                    <div className="bg-black/20 rounded p-4">
                      <h4 className="font-semibold text-orange-200 mb-2">2. Event Webhook Function</h4>
                      <code className="text-sm text-blue-400">POST /api/v1/hinges/events/webhook</code>
                      <p className="text-gray-300 text-sm mt-1">Receives device events with HMAC verification</p>
                    </div>
                    
                    <div className="bg-black/20 rounded p-4">
                      <h4 className="font-semibold text-orange-200 mb-2">3. Device Enrollment Function</h4>
                      <code className="text-sm text-purple-400">POST /api/v1/devices/enroll</code>
                      <p className="text-gray-300 text-sm mt-1">Zero-touch device provisioning with time-limited codes</p>
                    </div>
                  </div>

                  <div className="bg-gray-900/20 border border-gray-700/30 rounded p-4">
                    <h4 className="font-semibold text-gray-200 mb-2">Implementation Options</h4>
                    <ul className="text-gray-300 text-sm space-y-1">
                      <li>• AWS Lambda + API Gateway</li>
                      <li>• Vercel/Netlify Functions</li>
                      <li>• Express.js server on VPS</li>
                      <li>• Base44 Backend Functions (when available)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="device" className="space-y-4">
              <div className="bg-purple-900/20 border border-purple-700/30 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-purple-100 mb-4">Raspberry Pi Setup</h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-purple-200 mb-2">Hardware Requirements</h4>
                    <ul className="text-purple-300 text-sm space-y-1">
                      <li>• Raspberry Pi Zero 2 W</li>
                      <li>• MicroSD card (16GB+)</li>
                      <li>• 4-channel relay board (for lock control)</li>
                      <li>• Reed/Hall sensors for door position</li>
                      <li>• Pi Camera Module (optional)</li>
                      <li>• 5V power supply</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-purple-200 mb-2">GPIO Pin Mapping (BCM Mode)</h4>
                    <div className="bg-black/30 rounded p-4">
                      <div className="grid md:grid-cols-2 gap-3 text-sm">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between p-2 bg-purple-900/20 rounded">
                            <span className="text-purple-300">Relay Channel 1 (Lock)</span>
                            <code className="text-green-400 font-mono">GPIO 4</code>
                          </div>
                          <div className="flex items-center justify-between p-2 bg-purple-900/20 rounded">
                            <span className="text-purple-300">Relay Channel 2</span>
                            <code className="text-green-400 font-mono">GPIO 22</code>
                          </div>
                          <div className="flex items-center justify-between p-2 bg-purple-900/20 rounded">
                            <span className="text-purple-300">Relay Channel 3</span>
                            <code className="text-green-400 font-mono">GPIO 6</code>
                          </div>
                          <div className="flex items-center justify-between p-2 bg-purple-900/20 rounded">
                            <span className="text-purple-300">Relay Channel 4 (Spare)</span>
                            <code className="text-green-400 font-mono">GPIO 26</code>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="text-xs text-purple-300 bg-blue-900/20 p-3 rounded">
                            <strong>Hardware Notes:</strong>
                            <ul className="mt-2 space-y-1">
                              <li>• Use BCM pin numbering mode</li>
                              <li>• Relay board should be active-low</li>
                              <li>• Add flyback diodes to relay coils</li>
                              <li>• Keep wiring under 6 inches for reliability</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-purple-200 mb-2">Software Installation</h4>
                    <div className="bg-black/30 rounded p-3 font-mono text-xs space-y-1">
                      <div className="text-gray-400"># Install dependencies</div>
                      <div className="text-green-400">sudo apt update && sudo apt install -y python3-pip python3-venv</div>
                      <div className="text-green-400">python3 -m venv .venv && source .venv/bin/activate</div>
                      <div className="text-green-400">pip install paho-mqtt RPi.GPIO picamera2 requests</div>
                      <div className="text-gray-400 mt-2"># Clone the lock service</div>
                      <div className="text-green-400">git clone https://github.com/yourrepo/lock_service.git</div>
                      <div className="text-green-400">cd lock_service && chmod +x lock_service.py</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-purple-200 mb-2">Device Configuration File</h4>
                    <p className="text-purple-300 text-sm mb-2">Create <code className="bg-black/30 px-2 py-1 rounded">/etc/divine-hinge/config.json</code>:</p>
                    <div className="bg-black/30 rounded p-3 font-mono text-xs space-y-1">
                      <div className="text-blue-400">{'{'}</div>
                      <div className="text-green-400 ml-4">"device_id": "hinge-zero",</div>
                      <div className="text-green-400 ml-4">"mqtt_host": "your-broker.hivemq.cloud",</div>
                      <div className="text-green-400 ml-4">"mqtt_port": 8883,</div>
                      <div className="text-green-400 ml-4">"mqtt_username": "Confidence",</div>
                      <div className="text-green-400 ml-4">"mqtt_password": "Z9y8x7w6?",</div>
                      <div className="text-green-400 ml-4">"token": "change_this_token_28b7f0f5",</div>
                      <div className="text-green-400 ml-4">"gpio_pins": {'{'}</div>
                      <div className="text-yellow-400 ml-8">"relay_1": 4,</div>
                      <div className="text-yellow-400 ml-8">"relay_2": 22,</div>
                      <div className="text-yellow-400 ml-8">"relay_3": 6,</div>
                      <div className="text-yellow-400 ml-8">"relay_4": 26</div>
                      <div className="text-green-400 ml-4">{'}'}</div>
                      <div className="text-blue-400">{'}'}</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-purple-200 mb-2">Systemd Service Setup</h4>
                    <div className="bg-black/30 rounded p-3 font-mono text-xs space-y-1">
                      <div className="text-gray-400"># Create service file</div>
                      <div className="text-green-400">sudo nano /etc/systemd/system/lock-service.service</div>
                      <div className="text-gray-400 mt-2"># Enable and start</div>
                      <div className="text-green-400">sudo systemctl enable lock-service</div>
                      <div className="text-green-400">sudo systemctl start lock-service</div>
                      <div className="text-green-400">sudo systemctl status lock-service</div>
                    </div>
                  </div>

                  <div className="bg-yellow-900/20 border border-yellow-700/30 rounded p-4">
                    <h4 className="font-semibold text-yellow-200 mb-2">🔐 Security Best Practices</h4>
                    <ul className="text-yellow-300 text-sm space-y-1">
                      <li>• Change default token before deployment</li>
                      <li>• Use unique MQTT credentials per device</li>
                      <li>• Enable TLS for MQTT (port 8883)</li>
                      <li>• Store config file with restricted permissions (600)</li>
                      <li>• Rotate credentials every 90 days</li>
                    </ul>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="testing" className="space-y-4">
              <div className="bg-green-900/20 border border-green-700/30 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-green-100 mb-4">Testing & Monitoring</h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-green-200 mb-2">MQTT Connection Test</h4>
                    <div className="bg-black/30 rounded p-3 font-mono text-xs">
                      <div className="text-gray-400"># Test MQTT connection</div>
                      <div className="text-green-400">mosquitto_pub -h your-broker.hivemq.cloud -p 8883 \</div>
                      <div className="text-green-400">  -u your_username -P your_password \</div>
                      <div className="text-green-400">  --cafile ca.pem \</div>
                      <div className="text-green-400">  -t 'test/topic' -m 'hello world'</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-green-200 mb-2">Monitor Device Events</h4>
                    <div className="bg-black/30 rounded p-3 font-mono text-xs">
                      <div className="text-gray-400"># Subscribe to all hinge topics</div>
                      <div className="text-green-400">mosquitto_sub -h your-broker.hivemq.cloud -p 8883 \</div>
                      <div className="text-green-400">  -u your_username -P your_password \</div>
                      <div className="text-green-400">  -t 'hinge/+/+' -v</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-green-200 mb-2">Health Monitoring</h4>
                    <div className="grid md:grid-cols-2 gap-3 text-sm">
                      <div className="bg-black/20 rounded p-3">
                        <div className="text-blue-400 font-medium">Device Health</div>
                        <div className="text-gray-300 mt-1">
                          • Heartbeat every 30s<br/>
                          • Offline after 2 minutes<br/>
                          • Battery monitoring<br/>
                          • Temperature alerts
                        </div>
                      </div>
                      <div className="bg-black/20 rounded p-3">
                        <div className="text-purple-400 font-medium">Security Events</div>
                        <div className="text-gray-300 mt-1">
                          • Tamper detection<br/>
                          • Auth failures<br/>
                          • Command tracking<br/>
                          • Access logging
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-900/20 border border-yellow-700/30 rounded p-4">
                    <h4 className="font-semibold text-yellow-200 mb-2">🔧 Troubleshooting</h4>
                    <div className="text-yellow-300 text-sm space-y-1">
                      <div><strong>Device won't connect:</strong> Check MQTT credentials and firewall</div>
                      <div><strong>Commands not working:</strong> Verify topic permissions and device subscription</div>
                      <div><strong>Events not received:</strong> Check webhook URL and HMAC signature</div>
                      <div><strong>GPIO errors:</strong> Run as root and check pin assignments</div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
