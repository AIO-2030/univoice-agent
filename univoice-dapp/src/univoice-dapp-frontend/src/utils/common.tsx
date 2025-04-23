export const blobToBase64 = (blob: Blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      // const dataURL = reader.result;
      // const base64 = dataURL.split(',')[1] || dataURL;
      resolve(reader.result);
    }
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
export const base64ToBlob = (base64: string) => {
  try {
    // Check if the base64 string has the expected format
    if (!base64 || typeof base64 !== 'string') {
      console.warn('Invalid base64 string input:', base64);
      return new Blob([], { type: 'audio/wav' });
    }
    
    // Check if it's a data URL format or just a base64 string
    const parts = base64.split(',');
    const base64Data = parts.length > 1 ? parts[1] : base64;
    
    // If the string is actually a JSON object instead of base64
    if (base64Data.startsWith('{') || base64Data.startsWith('[')) {
      console.warn('Received JSON instead of base64:', base64Data.substring(0, 100));
      return new Blob([], { type: 'audio/wav' });
    }
    
    try {
      const binary = atob(base64Data);
      const array = [];
      for (let i = 0; i < binary.length; i++) {
        array.push(binary.charCodeAt(i));
      }
      return new Blob([new Uint8Array(array)], { type: 'audio/wav' });
    } catch (e) {
      console.error('Error decoding base64:', e);
      return new Blob([], { type: 'audio/wav' });
    }
  } catch (e) {
    console.error('Unexpected error in base64ToBlob:', e);
    return new Blob([], { type: 'audio/wav' });
  }
}

export const getAudioDuration = (base64String): Promise<number> => {
  return new Promise((resolve, reject) => {
    try {
      if (!base64String || typeof base64String !== 'string') {
        console.warn('Invalid base64 string input to getAudioDuration:', base64String);
        resolve(0);
        return;
      }
      
      // Parse only if it's a valid base64 string
      const parts = base64String.split(',');
      const base64Data = parts.length > 1 ? parts[1] : base64String;
      
      // Skip if it looks like JSON
      if (base64Data.startsWith('{') || base64Data.startsWith('[')) {
        console.warn('Received JSON instead of base64 in getAudioDuration');
        resolve(0);
        return;
      }
      
      const byteCharacters = atob(base64Data);
      const byteArrays = new Uint8Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteArrays[i] = byteCharacters.charCodeAt(i);
      }
      const arrayBuffer = byteArrays.buffer;
      const audioContext = new (window.AudioContext)();
      audioContext.decodeAudioData(arrayBuffer).then((audioBuffer)=>{
        const duration = audioBuffer.duration;
        audioContext.close();
        resolve(duration);
      }).catch(error => {
        console.error('Error decoding audio data:', error);
        audioContext.close();
        resolve(0);
      });
    } catch (e) {
      console.error('Error in getAudioDuration:', e);
      resolve(0);
    }
  });
}

export default blobToBase64;