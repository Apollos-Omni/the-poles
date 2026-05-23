
import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';
import mqtt from 'npm:mqtt@4.3.7';

// MQTT connection with TLS
const createMQTTClient = () => {
  const options = {
    host: Deno.env.get('MQTT_HOST'),
    port: parseInt(Deno.env.get('MQTT_PORT') || '8883'), // Default to 8883 for TLS
    protocol: 'mqtts', // TLS
    username: Deno.env.get('MQTT_USERNAME'),
    password: Deno.env.get('MQTT_PASSWORD'),
    connectTimeout: 10000,
    reconnectPeriod: 5000,
    keepalive: 60,
    clean: true
  };

  return mqtt.connect(options);
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { deviceId, commandType, args = {} } = await req.json();

    if (!deviceId || !commandType) {
      return Response.json({ 
        error: 'Missing required fields: deviceId, commandType' 
      }, { status: 400 });
    }

    // Generate unique request ID
    const requestId = crypto.randomUUID();
    
    // Validate device ownership
    const device = await base44.entities.HingeDevice.filter({ 
      device_id: deviceId, 
      owner_id: user.id 
    });

    if (device.length === 0) {
      return Response.json({ 
        error: 'Device not found or access denied' 
      }, { status: 403 });
    }

    // Create command record for audit trail
    const command = await base44.entities.HingeCommand.create({
      device_id: deviceId,
      command_type: commandType,
      request_id: requestId,
      issued_by: user.id,
      args: args,
      status: 'pending',
      issued_at: new Date().toISOString(),
      ip_address: req.headers.get('x-forwarded-for') || 'unknown',
      user_agent: req.headers.get('user-agent') || 'unknown'
    });

    // Prepare MQTT message
    const commandPayload = {
      requestId,
      command: commandType,
      args,
      timestamp: new Date().toISOString(),
      userId: user.id
    };

    // Publish to device command topic
    const topic = `hinge/cmd/${deviceId}`;
    
    return new Promise((resolve) => {
      const client = createMQTTClient();
      let resolved = false;

      const cleanup = () => {
        if (!resolved) {
          resolved = true;
          client.end(true);
        }
      };

      // Timeout handler
      const timeout = setTimeout(() => {
        cleanup();
        resolve(Response.json({ 
          error: 'MQTT publish timeout',
          requestId 
        }, { status: 408 }));
      }, 15000);

      client.on('connect', () => {
        console.log(`Publishing command ${commandType} to ${topic}`);
        
        client.publish(topic, JSON.stringify(commandPayload), { 
          qos: 1, 
          retain: false 
        }, async (error) => {
          clearTimeout(timeout);
          
          if (error) {
            console.error('MQTT publish error:', error);
            await base44.entities.HingeCommand.update(command.id, {
              status: 'failed',
              error_message: error.message
            });
            
            cleanup();
            resolve(Response.json({ 
              error: 'Failed to publish command',
              requestId 
            }, { status: 500 }));
          } else {
            await base44.entities.HingeCommand.update(command.id, {
              status: 'sent',
              sent_at: new Date().toISOString()
            });
            
            cleanup();
            resolve(Response.json({ 
              success: true,
              requestId,
              message: `Command ${commandType} sent to device ${deviceId}`
            }));
          }
        });
      });

      client.on('error', async (error) => {
        clearTimeout(timeout);
        console.error('MQTT connection error:', error);
        
        await base44.entities.HingeCommand.update(command.id, {
          status: 'failed',
          error_message: error.message
        });
        
        cleanup();
        resolve(Response.json({ 
          error: 'MQTT connection failed',
          requestId 
        }, { status: 500 }));
      });
    });

  } catch (error) {
    console.error('Command publication error:', error);
    return Response.json({ 
      error: error.message,
      code: 'COMMAND_PUBLISH_ERROR'
    }, { status: 500 });
  }
});
