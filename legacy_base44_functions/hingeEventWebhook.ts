import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

// HMAC verification for webhook security using Web Crypto API
const verifyWebhookSignature = async (payload, signature, secret) => {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(payload);
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const expectedSignature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
  const expectedHex = Array.from(new Uint8Array(expectedSignature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  // Constant time comparison
  if (signature.length !== expectedHex.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < signature.length; i++) {
    result |= signature.charCodeAt(i) ^ expectedHex.charCodeAt(i);
  }
  
  return result === 0;
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify webhook signature
    const signature = req.headers.get('x-webhook-signature');
    const payload = await req.text();
    const secret = Deno.env.get('WEBHOOK_SECRET');
    
    if (!signature || !(await verifyWebhookSignature(payload, signature, secret))) {
      console.warn('Invalid webhook signature');
      return Response.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const eventData = JSON.parse(payload);
    
    const { 
      deviceId, 
      eventType, 
      data = {}, 
      timestamp,
      requestId,
      severity = 'info'
    } = eventData;

    if (!deviceId || !eventType) {
      return Response.json({ 
        error: 'Missing required fields: deviceId, eventType' 
      }, { status: 400 });
    }

    // Verify device exists
    const device = await base44.asServiceRole.entities.HingeDevice.filter({ 
      device_id: deviceId 
    });

    if (device.length === 0) {
      console.warn(`Event from unknown device: ${deviceId}`);
      return Response.json({ 
        error: 'Unknown device',
        deviceId 
      }, { status: 404 });
    }

    const deviceRecord = device[0];

    // Update device last seen
    await base44.asServiceRole.entities.HingeDevice.update(deviceRecord.id, {
      last_seen_at: new Date().toISOString(),
      is_online: true
    });

    // Create event record
    const event = await base44.asServiceRole.entities.HingeEvent.create({
      device_id: deviceId,
      event_type: eventType,
      timestamp: timestamp || new Date().toISOString(),
      request_id: requestId,
      actor: 'device',
      data: data,
      severity: severity,
      processed: false
    });

    // Handle specific event types
    switch (eventType) {
      case 'STATE': {
        // Update device state
        if (data.lock_state || data.door_state) {
          const existingState = await base44.asServiceRole.entities.HingeState.filter({ 
            device_id: deviceId 
          });
          
          const stateUpdate = {
            device_id: deviceId,
            updated_at: new Date().toISOString(),
            ...data
          };
          
          if (existingState.length > 0) {
            await base44.asServiceRole.entities.HingeState.update(existingState[0].id, stateUpdate);
          } else {
            await base44.asServiceRole.entities.HingeState.create({
              lock_state: 'locked',
              door_state: 'unknown',
              ...stateUpdate
            });
          }
        }
        break;
      }

      case 'COMMAND_ACK': {
        // Update command status
        if (requestId) {
          const commands = await base44.asServiceRole.entities.HingeCommand.filter({ 
            request_id: requestId 
          });
          
          if (commands.length > 0) {
            await base44.asServiceRole.entities.HingeCommand.update(commands[0].id, {
              status: data.success ? 'completed' : 'failed',
              completed_at: new Date().toISOString(),
              error_message: data.error || null
            });
          }
        }
        break;
      }

      case 'TAMPER':
      case 'ERROR': {
        // Update device state for critical events
        const stateRecords = await base44.asServiceRole.entities.HingeState.filter({ 
          device_id: deviceId 
        });
        
        if (stateRecords.length > 0) {
          await base44.asServiceRole.entities.HingeState.update(stateRecords[0].id, {
            tamper_detected: eventType === 'TAMPER' ? (data.tamper_active || true) : stateRecords[0].tamper_detected,
            updated_at: new Date().toISOString()
          });
        }
        break;
      }

      case 'SNAPSHOT_OK':
      case 'VIDEO_OK': {
        // Create media asset record
        if (data.file_url) {
          await base44.asServiceRole.entities.MediaAsset.create({
            device_id: deviceId,
            asset_type: eventType === 'SNAPSHOT_OK' ? 'snapshot' : 'video_clip',
            file_url: data.file_url,
            thumbnail_url: data.thumbnail_url,
            file_size: data.file_size,
            width: data.width,
            height: data.height,
            duration_seconds: data.duration_seconds,
            sha256_hash: data.file_hash,
            captured_at: timestamp || new Date().toISOString(),
            trigger_event: data.trigger || 'manual',
            is_public: false
          });
        }
        break;
      }
    }

    // Mark event as processed
    await base44.asServiceRole.entities.HingeEvent.update(event.id, {
      processed: true
    });

    console.log(`Processed ${eventType} event from device ${deviceId}`);

    return Response.json({ 
      success: true,
      eventId: event.id,
      message: 'Event processed successfully'
    });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return Response.json({ 
      error: error.message,
      code: 'WEBHOOK_PROCESS_ERROR'
    }, { status: 500 });
  }
});