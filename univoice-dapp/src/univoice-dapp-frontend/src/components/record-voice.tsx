import { useState } from 'react'
import style from './record-voice.module.scss'
import Timer from '@/components/timer'
import { useReactMediaRecorder } from "react-media-recorder-2";
import { blobToBase64 } from '@/utils/common'
import { voice_upload } from '@/utils/voiceossbuss'
import { Principal } from '@dfinity/principal'
import { useAcountStore } from '@/stores/user'

const RecordVoice = ({
  onClose
}) => {
    const [isPressing, setPressing] = useState(false);
    let timer = null;
    const [recordTimer, setRecordTimer] = useState(0)
    const [isRecording, setIsRecording] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const handleMouseDown = () => {
      timer = setTimeout(() => {
        setPressing(true);
        startRecord();
      }, 600);
    };
    
    const handleMouseUp = () => {
      clearTimeout(timer);
      if (isPressing) {
        setPressing(false);
        stopRecord();
      }
    };

    const startRecord = () => {
      console.log('start record')
      startRecording()
      setRecordTimer(new Date().getTime())
      setIsRecording(true)
    }
    const stopRecord = () => {
      console.log('end record')
      stopRecording()
      setRecordTimer(0)
      setIsRecording(false)
    }

    const doUploadVoice = async (mediaBlobUrl: string, blob: Blob) => {
      try {
        setIsUploading(true);
        console.log("Fetch blob success:" + mediaBlobUrl);
        
        if(blob != null || blob != undefined) {
          console.log("Blob voice is not null", blob);
          
          // Create a File object from the Blob
          const now = new Date();
          const fileName = `voice_${now.getTime()}.wav`;
          const file = new File([blob], fileName, { type: 'audio/wav' });
          
          // Get the current user's principal ID
          // Note: In a real app, you'd get this from your auth context
          // This is just a placeholder - replace with your actual auth logic
          const principalId = useAcountStore.getState().getPrincipal();
          
          // Add metadata for the voice recording
          const duration = Math.round((now.getTime() - recordTimer) / 1000);
          const metadata = {
            title: fileName,
            description: "Voice recording created with UniVoice",
            duration: duration,
            tags: ["voice", "recording"]
          };
          
          // Upload the voice recording to OSS
          const fileId = await voice_upload(
            file,
            "0", // folder path - root folder ID
            principalId,
            metadata
          );
          
          console.log("Voice uploaded successfully with ID:", fileId);
          
          // If you have an onClose callback that expects the file ID
          if (onClose) {
            onClose(fileId);
          }
        }
      } catch (error) {
        console.error("Error uploading voice:", error);
        // Handle upload error - you might want to show a notification
      } finally {
        setIsUploading(false);
      }
    }

    const {
      status,
      startRecording,
      stopRecording,
      mediaBlobUrl,
    } = useReactMediaRecorder({ 
      audio: true,
      blobPropertyBag: {
        type: "audio/wav",
      },
      onStop: doUploadVoice
    });

  return (
    <div className={style.recordPanel}>
      <div className={style.timer}>
        <Timer start={recordTimer} />
      </div>
      <div className={style.btnAnimate}>
        {/* Simple CSS-based recording animation that doesn't require external WASM */}
        <div className={`${style.recordingAnimation} ${isRecording ? style.active : ''}`}>
          <div className={style.circle}></div>
          <div className={style.circle}></div>
          <div className={style.circle}></div>
        </div>
      </div>
      <div className={style.btnRecord}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchEnd={handleMouseUp}
        onMouseLeave={handleMouseUp}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32" fill="#ffffff">
          <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
          <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
        </svg>
      </div>
      <div className={style.tip}>
        {isUploading ? 'Uploading your voice...' : 'Press and hold to record your exclusive voice.'}
      </div>
    </div>
  );
}

export default RecordVoice;