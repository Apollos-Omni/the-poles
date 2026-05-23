
import { useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function DeepLinkHandler() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleAction = useCallback((action, entityId) => {
    switch (action) {
      case 'unlock_hinge':
        // Navigate to hinge control and trigger unlock
        navigate(createPageUrl('HingeControl'), { 
          state: { 
            selectedDevice: entityId,
            pendingAction: 'unlock'
          } 
        });
        break;
        
      case 'view_vision':
        navigate(createPageUrl(`VisionDetail/${entityId}`));
        break;
        
      case 'log_activity':
        navigate(createPageUrl(`VisionDetail/${entityId}`), {
          state: { showLogActivity: true }
        });
        break;
        
      default:
        console.warn(`Unknown action: ${action}`);
        break;
    }
  }, [navigate]); // navigate is a stable function provided by react-router-dom, but including it is good practice for useCallback.

  const handleDeepLink = useCallback(() => {
    const params = new URLSearchParams(location.search);
    const deepLink = params.get('link');
    const action = params.get('action');
    const entityId = params.get('id');

    if (deepLink) {
      // Handle various deep link patterns
      switch (deepLink) {
        case 'vision':
          if (entityId) {
            navigate(createPageUrl(`VisionDetail/${entityId}`));
          } else {
            navigate(createPageUrl('VisionTracker'));
          }
          break;
          
        case 'hinge':
          if (entityId) {
            navigate(createPageUrl('HingeControl'), { 
              state: { selectedDevice: entityId } 
            });
          } else {
            navigate(createPageUrl('HingeControl'));
          }
          break;
          
        case 'profile':
          if (entityId) {
            navigate(createPageUrl(`Profile/${entityId}`));
          } else {
            navigate(createPageUrl('Profile'));
          }
          break;
          
        case 'dashboard':
          navigate(createPageUrl('Dashboard'));
          break;
          
        default:
          // Try to navigate to the link as a page name
          try {
            navigate(createPageUrl(deepLink));
          } catch (error) {
            console.warn(`Unknown deep link: ${deepLink}`);
            navigate(createPageUrl('Dashboard'));
          }
          break;
      }
    }

    if (action && entityId) {
      handleAction(action, entityId);
    }
  }, [location, navigate, handleAction]); // Depend on location, navigate, and the memoized handleAction

  useEffect(() => {
    handleDeepLink();
  }, [handleDeepLink]); // Depend on the memoized handleDeepLink

  return null; // This component doesn't render anything
}

// Utility functions for creating deep links
export const createDeepLink = (type, id = null, action = null) => {
  const baseUrl = window.location.origin;
  const params = new URLSearchParams();
  
  params.set('link', type);
  if (id) params.set('id', id);
  if (action) params.set('action', action);
  
  return `${baseUrl}?${params.toString()}`;
};

export const createNotificationDeepLink = (notificationType, entityId, action = null) => {
  switch (notificationType) {
    case 'hinge_unlocked':
      return createDeepLink('hinge', entityId, 'view');
      
    case 'vision_milestone':
      return createDeepLink('vision', entityId, 'view_vision');
      
    case 'vision_support':
      return createDeepLink('vision', entityId, 'view_vision');
      
    case 'hinge_tamper':
      return createDeepLink('hinge', entityId, 'view');
      
    default:
      return createDeepLink('dashboard');
  }
};
