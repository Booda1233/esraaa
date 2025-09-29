import { useState, useRef, useEffect } from 'react';

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.onerror = reject;
  });
};

export const useAudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mimeTypes = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4'];
      const supportedMimeType = mimeTypes.find(type => MediaRecorder.isTypeSupported(type));

      if (!supportedMimeType) {
        console.error("No supported MIME type found for MediaRecorder");
        alert("Audio recording is not supported on this browser.");
        return;
      }
      
      const options = { mimeType: supportedMimeType };
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstart = () => {
          setIsRecording(true);
          setRecordingTime(0);
          timerRef.current = window.setInterval(() => {
              setRecordingTime(prev => prev + 1);
          }, 1000);
      };
      
      mediaRecorder.start();

    } catch (err) {
      console.error("Error starting audio recording:", err);
      alert(`Could not start audio recording: ${err.message}`);
    }
  };

  const stopRecording = (): Promise<{ audioUrl: string; audioBlob: Blob } | null> => {
    return new Promise((resolve) => {
        if (!mediaRecorderRef.current || mediaRecorderRef.current.state === "inactive") {
            resolve(null);
            return;
        }

        mediaRecorderRef.current.onstop = async () => {
            if (timerRef.current) clearInterval(timerRef.current);
            setIsRecording(false);
            
            const audioBlob = new Blob(chunksRef.current, { type: mediaRecorderRef.current?.mimeType });
            const audioUrl = await blobToBase64(audioBlob);

            chunksRef.current = [];
            mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop());
            resolve({ audioUrl, audioBlob });
        };

        mediaRecorderRef.current.stop();
    });
  };
  
  useEffect(() => {
    return () => { // Cleanup on unmount
      if (timerRef.current) clearInterval(timerRef.current);
      mediaRecorderRef.current?.stream?.getTracks().forEach(track => track.stop());
    };
  }, []);

  return { isRecording, recordingTime, startRecording, stopRecording };
};