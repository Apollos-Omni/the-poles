import React, { useEffect, useRef, useState } from 'react';

const HingeControlEmbed = () => {
  const containerRef = useRef(null);
  const [status, setStatus] = useState('Initializing...');
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [channelStates, setChannelStates] = useState({
    1: 'unknown',
    2: 'unknown',
    3: 'unknown',
    4: 'unknown'
  });

  useEffect(() => {
    if (!containerRef.current) {
      setStatus('Container not ready');
      return;
    }

    setStatus('Loading MQTT library...');

    // Check if mqtt.js is already loaded
    if (window.mqtt) {
      setScriptLoaded(true);
      setStatus('MQTT library ready');
      initializeMqtt();
      return;
    }

    // Load mqtt.js script
    const scriptId = 'mqtt-js-script';
    if (document.getElementById(scriptId)) {
      // Script tag exists, wait for it to load
      const checkInterval = setInterval(() => {
        if (window.mqtt) {
          clearInterval(checkInterval);
          setScriptLoaded(true);
          setStatus('MQTT library loaded');
          initializeMqtt();
        }
      }, 100);
      return () => clearInterval(checkInterval);
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = "https://unpkg.com/mqtt/dist/mqtt.min.js";
    script.async = true;
    
    script.onload = () => {
      setScriptLoaded(true);
      setStatus('MQTT library loaded');
      initializeMqtt();
    };
    
    script.onerror = () => {
      setStatus('Failed to load MQTT library');
      console.error('Failed to load mqtt.js');
    };

    document.body.appendChild(script);

    return () => {
      // Cleanup on unmount
    };
  }, []);

  const initializeMqtt = () => {
    if (!window.mqtt || !containerRef.current) {
      console.error('MQTT or container not available');
      return;
    }

    const container = containerRef.current;
    
    const HOST = 'hinge-zero-9f1760e0.a02.usw2.aws.hivemq.cloud';
    const USER = 'Confidence';
    const PASS = 'Z9y8x7w6?';
    const TOKEN = 'change_this_token_28b7f0f5';
    const BASE = 'hinge/hinge-zero';
    const WSS = `wss://${HOST}:8884/mqtt`;

    const $ = (s) => container.querySelector(s);
    const log = (m) => { 
      const el = $('#log'); 
      if (el) { 
        el.textContent += m + '\n'; 
        el.scrollTop = el.scrollHeight; 
      }
    };
    const setStatusUI = (txt, color = '#666') => { 
      const textEl = $('#status-text'); 
      const dotEl = $('#status-dot'); 
      if (textEl) textEl.textContent = txt; 
      if (dotEl) dotEl.style.background = color; 
    };
    const updateChannelState = (channel, state) => {
      const el = $(`#state-ch${channel}`);
      if (el) el.textContent = state;
      setChannelStates(prev => ({ ...prev, [channel]: state }));
    };
    const setLast = (s) => { const el = $('#last'); if (el) el.textContent = s; };

    let client;
    
    const connect = () => {
      if (!window.mqtt) {
        log('MQTT library not loaded yet.');
        return;
      }
      
      const CID = 'ourworld-' + Math.random().toString(16).slice(2);
      setStatus('Connecting to broker...');
      
      try {
        client = window.mqtt.connect(WSS, {
          username: USER, 
          password: PASS, 
          clientId: CID,
          protocolVersion: 4, 
          clean: true, 
          reconnectPeriod: 3000,
        });

        client.on('connect', () => {
          setStatusUI('Connected', '#21c55d');
          setStatus('Connected to MQTT broker');
          log('Connected to MQTT broker');
          client.subscribe(`${BASE}/#`, { qos: 1 }, (err) => {
            if (err) log('SUB error: ' + err.message);
            else log('Subscribed to ' + BASE + '/#');
          });
          // Initial pulse on channel 1 to test connection
          client.publish(`${BASE}/cmd`, JSON.stringify({cmd:'pulse', channel: 1, ms:200, token: TOKEN}), { qos: 1 });
        });

        client.on('reconnect', () => {
          setStatusUI('Reconnecting…', '#eab308');
          setStatus('Reconnecting...');
        });
        
        client.on('offline', () => {
          setStatusUI('Offline', '#666');
          setStatus('Offline');
        });
        
        client.on('error', (e) => { 
          setStatusUI('Error', '#ef4444'); 
          setStatus('Connection error: ' + e.message);
          log('MQTT error: ' + e.message); 
        });

        client.on('message', (topic, buf) => {
          const s = buf.toString();
          log(topic + ' ' + s);
          
          if (topic.endsWith('/state')) {
            try {
              const stateData = JSON.parse(s);
              // Update individual channel states if provided
              if (stateData.channel && stateData.state) {
                updateChannelState(stateData.channel, stateData.state);
                setLast(`Ch${stateData.channel}: ${stateData.state}`);
              }
              // Handle bulk state updates
              if (stateData.channels) {
                Object.entries(stateData.channels).forEach(([ch, state]) => {
                  updateChannelState(ch, state);
                });
              }
            } catch (e) {
              // Not JSON, treat as single state
              log('State update: ' + s);
            }
          } else if (topic.endsWith('/status')) {
            setStatusUI(s === 'online' ? 'Connected' : 'Offline', s === 'online' ? '#21c55d' : '#666');
            setLast('status: ' + s);
          } else if (topic.endsWith('/resp')) {
            try {
              const obj = JSON.parse(s);
              if (obj.ok && obj.note) setLast(obj.note);
              if (obj.channel && obj.state) {
                updateChannelState(obj.channel, obj.state);
              }
            } catch (e) {
              // Ignore parse errors
            }
          }
        });
      } catch (error) {
        setStatus('Failed to connect: ' + error.message);
        log('Connection error: ' + error.message);
      }
    };

    const send = (cmd, channel, extra = {}) => {
      if (!client || !client.connected) {
        log('not connected');
        return;
      }
      const msg = JSON.stringify({ cmd, channel, token: TOKEN, ...extra });
      client.publish(`${BASE}/cmd`, msg, { qos: 1 });
      log(`Sent: ${cmd} on channel ${channel}`);
    };

    const sendBulk = (cmd, channels, extra = {}) => {
      if (!client || !client.connected) {
        log('not connected');
        return;
      }
      channels.forEach(channel => {
        const msg = JSON.stringify({ cmd, channel, token: TOKEN, ...extra });
        client.publish(`${BASE}/cmd`, msg, { qos: 1 });
      });
      log(`Sent: ${cmd} to channels ${channels.join(', ')}`);
    };

    const refreshNow = () => {
      if (!client) {
        connect();
        return;
      }
      try {
        client.unsubscribe(`${BASE}/#`, () => {
          client.subscribe(`${BASE}/#`, { qos: 1 }, () => {
            client.publish(`${BASE}/cmd`, JSON.stringify({cmd:'pulse', channel: 1, ms:100, token: TOKEN}), { qos: 1 });
            setLast('refreshed');
            log('Refreshed subscription');
          });
        });
      } catch (e) {
        client.end(true, () => connect());
      }
    };

    // Attach individual channel button handlers
    for (let ch = 1; ch <= 4; ch++) {
      const lockBtn = $(`#btn-lock-ch${ch}`);
      const unlockBtn = $(`#btn-unlock-ch${ch}`);
      const pulseBtn = $(`#btn-pulse-ch${ch}`);
      
      if (lockBtn) lockBtn.onclick = () => send('lock', ch);
      if (unlockBtn) unlockBtn.onclick = () => send('unlock', ch);
      if (pulseBtn) pulseBtn.onclick = () => send('pulse', ch, { ms: 300 });
    }

    // Attach bulk action handlers (channels 1-3)
    const lockAllBtn = $('#btn-lock-all');
    const unlockAllBtn = $('#btn-unlock-all');
    const pulseAllBtn = $('#btn-pulse-all');
    const refreshBtn = $('#btn-refresh');

    if (lockAllBtn) lockAllBtn.onclick = () => sendBulk('lock', [1, 2, 3]);
    if (unlockAllBtn) unlockAllBtn.onclick = () => sendBulk('unlock', [1, 2, 3]);
    if (pulseAllBtn) pulseAllBtn.onclick = () => sendBulk('pulse', [1, 2, 3], { ms: 300 });
    if (refreshBtn) refreshBtn.onclick = () => refreshNow();

    setStatusUI('Connecting…', '#666');
    connect();
  };

  const channelConfig = [
    { id: 1, name: 'Hinge 1', gpio: 4, color: 'from-blue-600 to-blue-700' },
    { id: 2, name: 'Hinge 2', gpio: 22, color: 'from-purple-600 to-purple-700' },
    { id: 3, name: 'Hinge 3', gpio: 6, color: 'from-green-600 to-green-700' },
    { id: 4, name: 'Spare', gpio: 26, color: 'from-gray-600 to-gray-700' }
  ];

  return (
    <div className="space-y-3">
      {/* Debug Status */}
      <div className="text-xs text-blue-300 bg-blue-900/20 p-2 rounded">
        Status: {status} {scriptLoaded && '✓'}
      </div>
      
      {/* Main Control Panel */}
      <div ref={containerRef} className="space-y-3">
        <div className="bg-gradient-to-br from-purple-900/40 to-black/60 border border-purple-700/30 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-lg font-semibold text-purple-100">Multi-Channel Hinge Control</h3>
              <p className="text-xs text-purple-300">Device: hinge-zero • 4 Relay Channels</p>
            </div>
            <div className="flex items-center gap-2">
              <div id="status-dot" className="w-2.5 h-2.5 rounded-full bg-gray-500 transition-colors"></div>
              <span id="status-text" className="text-sm text-purple-200">Connecting…</span>
            </div>
          </div>

          {/* Bulk Actions */}
          <div className="mb-4 p-3 bg-black/30 rounded-lg border border-purple-700/20">
            <h4 className="text-sm font-semibold text-purple-200 mb-2">Bulk Actions (Channels 1-3)</h4>
            <div className="grid grid-cols-3 gap-2">
              <button 
                id="btn-lock-all"
                className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white text-sm font-medium transition-colors"
              >
                Lock All
              </button>
              <button 
                id="btn-unlock-all"
                className="px-3 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white text-sm font-medium transition-colors"
              >
                Unlock All
              </button>
              <button 
                id="btn-pulse-all"
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm font-medium transition-colors"
              >
                Pulse All
              </button>
            </div>
          </div>

          {/* Individual Channel Controls */}
          <div className="space-y-3">
            {channelConfig.map(channel => (
              <div key={channel.id} className={`p-3 bg-gradient-to-r ${channel.color} bg-opacity-20 rounded-lg border border-white/10`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${channel.color}`}></div>
                    <span className="font-semibold text-white text-sm">{channel.name}</span>
                    <span className="text-xs text-gray-400">GPIO {channel.gpio}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-purple-300">State:</span>
                    <strong id={`state-ch${channel.id}`} className="text-xs text-purple-100">
                      {channelStates[channel.id]}
                    </strong>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button 
                    id={`btn-lock-ch${channel.id}`}
                    className="px-3 py-1.5 bg-red-600/80 hover:bg-red-700 rounded text-white text-xs font-medium transition-colors"
                  >
                    Lock
                  </button>
                  <button 
                    id={`btn-unlock-ch${channel.id}`}
                    className="px-3 py-1.5 bg-green-600/80 hover:bg-green-700 rounded text-white text-xs font-medium transition-colors"
                  >
                    Unlock
                  </button>
                  <button 
                    id={`btn-pulse-ch${channel.id}`}
                    className="px-3 py-1.5 bg-blue-600/80 hover:bg-blue-700 rounded text-white text-xs font-medium transition-colors"
                  >
                    Pulse
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Status Bar */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-purple-700/30">
            <div className="text-xs text-purple-300">
              Last: <span id="last" className="text-purple-100">—</span>
            </div>
            <button 
              id="btn-refresh"
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 rounded text-white text-xs font-medium transition-colors"
            >
              Refresh
            </button>
          </div>
          
          {/* Activity Log */}
          <pre 
            id="log" 
            className="mt-3 bg-black/40 text-purple-300 p-3 rounded-lg h-32 overflow-y-auto text-xs font-mono"
          ></pre>
        </div>
      </div>
    </div>
  );
};

export default HingeControlEmbed;