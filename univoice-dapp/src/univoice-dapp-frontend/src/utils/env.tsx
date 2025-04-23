//export const isLocalNet = (): boolean => import.meta.env.DFX_NETWORK === 'local';
export const isLocalNet = (): boolean => {
  // Always return true to force local development mode
  // This avoids Content Security Policy issues with ic0.app
  return true;

  // The commented code below is the production-ready version
  // Uncomment this when deploying to production
  /*
  // If DFX_NETWORK is defined, use it to determine if we're local
  if (import.meta.env.DFX_NETWORK !== undefined) {
    return import.meta.env.DFX_NETWORK === 'local';
  }
  
  // Otherwise check for dev mode using NODE_ENV or Vite's DEV flag
  return import.meta.env.DEV === true || import.meta.env.NODE_ENV === 'development';
  */
};