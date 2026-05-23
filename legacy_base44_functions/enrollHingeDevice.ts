import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';
import crypto from 'node:crypto';

// Generate secure enrollment codes
const generateEnrollmentCode = () => {
  return crypto.randomBytes(16).toString('hex').toUpperCase();
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { method } = req;

    if (method === 'POST') {
      // Generate new enrollment code
      const { deviceId, deviceName, location } = await req.json();

      if (!deviceId) {
        return Response.json({ 
          error: 'deviceId is required' 
        }, { status: 400 });
      }

      // Check if device already exists
      const existingDevice = await base44.entities.HingeDevice.filter({ 
        device_id: deviceId 
      });

      if (existingDevice.length > 0) {
        return Response.json({ 
          error: 'Device already enrolled',
          deviceId 
        }, { status: 409 });
      }

      // Generate enrollment code (expires in 1 hour)
      const enrollmentCode = generateEnrollmentCode();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1);

      const enrollment = await base44.entities.DeviceEnrollment.create({
        enrollment_code: enrollmentCode,
        device_id: deviceId,
        issued_by: user.id,
        expires_at: expiresAt.toISOString(),
        device_info: {
          name: deviceName || `Device ${deviceId}`,
          location: location || 'Unknown Location',
          requested_by: user.email
        },
        status: 'pending'
      });

      return Response.json({
        success: true,
        enrollmentCode,
        deviceId,
        expiresAt: expiresAt.toISOString(),
        enrollmentId: enrollment.id,
        instructions: {
          step1: 'Power on your Divine Hinge device',
          step2: 'Connect to your WiFi network',
          step3: 'Enter the enrollment code when prompted',
          step4: 'Device will automatically register and appear in your dashboard'
        }
      });

    } else if (method === 'PUT') {
      // Device claiming enrollment (called by device)
      const { enrollmentCode, deviceInfo = {} } = await req.json();

      if (!enrollmentCode) {
        return Response.json({ 
          error: 'enrollmentCode is required' 
        }, { status: 400 });
      }

      // Find enrollment record
      const enrollments = await base44.asServiceRole.entities.DeviceEnrollment.filter({ 
        enrollment_code: enrollmentCode,
        status: 'pending'
      });

      if (enrollments.length === 0) {
        return Response.json({ 
          error: 'Invalid or expired enrollment code' 
        }, { status: 404 });
      }

      const enrollment = enrollments[0];

      // Check expiration
      if (new Date() > new Date(enrollment.expires_at)) {
        await base44.asServiceRole.entities.DeviceEnrollment.update(enrollment.id, {
          status: 'expired'
        });
        return Response.json({ 
          error: 'Enrollment code has expired' 
        }, { status: 410 });
      }

      // Create device record
      const device = await base44.asServiceRole.entities.HingeDevice.create({
        device_id: enrollment.device_id,
        owner_id: enrollment.issued_by,
        name: enrollment.device_info.name || `Device ${enrollment.device_id}`,
        location: enrollment.device_info.location || 'Unknown',
        mqtt_client_id: `hinge-${enrollment.device_id.toLowerCase()}`,
        firmware_version: deviceInfo.firmware_version || '1.0.0',
        hardware_revision: deviceInfo.hardware_revision || 'Rev A',
        last_seen_at: new Date().toISOString(),
        enrollment_date: new Date().toISOString(),
        is_online: true
      });

      // Create initial device state
      await base44.asServiceRole.entities.HingeState.create({
        device_id: enrollment.device_id,
        lock_state: 'locked',
        door_state: 'unknown',
        hinge_angle: 0,
        tamper_detected: false,
        rssi: deviceInfo.rssi || -50,
        temperature: deviceInfo.temperature || 20,
        uptime_seconds: 0,
        auto_relock_enabled: true,
        auto_relock_delay: 30,
        updated_at: new Date().toISOString()
      });

      // Mark enrollment as used
      await base44.asServiceRole.entities.DeviceEnrollment.update(enrollment.id, {
        status: 'used',
        used_at: new Date().toISOString()
      });

      console.log(`Device ${enrollment.device_id} successfully enrolled`);

      return Response.json({
        success: true,
        deviceId: enrollment.device_id,
        deviceRecord: device,
        message: 'Device enrolled successfully',
        mqttConfig: {
          clientId: device.mqtt_client_id,
          topics: {
            commands: `hinge/cmd/${enrollment.device_id}`,
            events: `hinge/evt/${enrollment.device_id}`,
            state: `hinge/state/${enrollment.device_id}`
          }
        }
      });

    } else {
      return Response.json({ error: 'Method not allowed' }, { status: 405 });
    }

  } catch (error) {
    console.error('Device enrollment error:', error);
    return Response.json({ 
      error: error.message,
      code: 'ENROLLMENT_ERROR'
    }, { status: 500 });
  }
});