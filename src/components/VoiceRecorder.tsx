
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Mic, MicOff, Square, Play } from 'lucide-react';

interface VoiceRecorderProps {
  selectedLanguage: string;
  transcription: string;
  onTranscriptionChange: (text: string) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
}

const VoiceRecorder = ({ 
  selectedLanguage, 
  transcription, 
  onTranscriptionChange, 
  onAnalyze,
  isAnalyzing 
}: VoiceRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const recognitionRef = useRef<any>(null);
  const intervalRef = useRef<any>(null);

  useEffect(() => {
    // Check if browser supports speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        onTranscriptionChange(transcription + finalTranscript + interimTranscript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = getLanguageCode(selectedLanguage);
    }
  }, [selectedLanguage]);

  const getLanguageCode = (langCode: string) => {
    const languageMap: { [key: string]: string } = {
      'en': 'en-US',
      'hi': 'hi-IN',
      'te': 'te-IN',
      'ta': 'ta-IN',
      'kn': 'kn-IN'
    };
    return languageMap[langCode] || 'en-US';
  };

  const startRecording = () => {
    if (recognitionRef.current) {
      setIsRecording(true);
      setIsPaused(false);
      recognitionRef.current.start();
      
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
  };

  const pauseRecording = () => {
    if (recognitionRef.current) {
      setIsPaused(true);
      recognitionRef.current.stop();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  };

  const resumeRecording = () => {
    if (recognitionRef.current) {
      setIsPaused(false);
      recognitionRef.current.start();
      
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      setIsRecording(false);
      setIsPaused(false);
      recognitionRef.current.stop();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">Voice Recording</h3>
      
      {/* Recording Controls */}
      <div className="flex items-center justify-center gap-4 p-6 bg-gray-50 rounded-lg">
        {!isRecording ? (
          <Button
            onClick={startRecording}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-3 text-lg"
            disabled={isAnalyzing}
          >
            <Mic className="w-5 h-5" />
            Start Recording
          </Button>
        ) : (
          <div className="flex items-center gap-3">
            {!isPaused ? (
              <Button
                onClick={pauseRecording}
                variant="outline"
                className="flex items-center gap-2"
              >
                <MicOff className="w-4 h-4" />
                Pause
              </Button>
            ) : (
              <Button
                onClick={resumeRecording}
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600"
              >
                <Play className="w-4 h-4" />
                Resume
              </Button>
            )}
            
            <Button
              onClick={stopRecording}
              variant="destructive"
              className="flex items-center gap-2"
            >
              <Square className="w-4 h-4" />
              Stop
            </Button>
          </div>
        )}
      </div>

      {/* Recording Status */}
      {isRecording && (
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 text-red-500">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="font-medium">
              {isPaused ? 'Paused' : 'Recording'} - {formatTime(recordingTime)}
            </span>
          </div>
        </div>
      )}

      {/* Transcription Display */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Transcription
        </label>
        <Textarea
          value={transcription}
          onChange={(e) => onTranscriptionChange(e.target.value)}
          placeholder="Your speech will appear here as you speak..."
          className="min-h-[150px] resize-none"
          rows={6}
        />
      </div>

      {/* Analyze Button */}
      <Button
        onClick={onAnalyze}
        disabled={!transcription.trim() || isAnalyzing}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg"
      >
        {isAnalyzing ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Analyzing...
          </div>
        ) : (
          'Analyze Recording'
        )}
      </Button>
    </div>
  );
};

export default VoiceRecorder;
