import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  LiveKitRoom,
  VideoConference,
  RoomAudioRenderer,
} from '@livekit/components-react';

import '@livekit/components-styles';
import { endCall, sendTranscript } from '../api/callApi';
import { useSocket } from '../context/SocketContext';

const VideoCall = () => {
  const { callId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [token, setToken] = useState('');
  const [roomName, setRoomName] = useState('');
  const [transcriptText, setTranscriptText] = useState('');
  
  const [localTranscripts, setLocalTranscripts] = useState([]);
  const [interimTranscript, setInterimTranscript] = useState('');
  
  const { socket } = useSocket();

  useEffect(() => {
    if (location.state && location.state.token) {
      setToken(location.state.token);
      setRoomName(location.state.roomName);
    } else {
      alert("Missing call token. Redirecting to home.");
      navigate('/');
    }
  }, [location, navigate]);

  useEffect(() => {
    if (!socket) return;
    
    const handleNewTranscript = (data) => {
      const name = data.speakerName || `User ${data.speakerId}`;
      const formatted = `[${name}]: ${data.text}`;
      setLocalTranscripts(prev => [...prev, formatted]);
    };
    
    socket.on("NEW_TRANSCRIPT", handleNewTranscript);
    
    return () => {
      socket.off("NEW_TRANSCRIPT", handleNewTranscript);
    };
  }, [socket]);

  const [isListening, setIsListening] = useState(false);
  const [recognitionInstance, setRecognitionInstance] = useState(null);

  // Set up Web Speech API for automatic live transcription
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Speech Recognition API not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = async (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          const transcript = event.results[i][0].transcript;
          try {
            setLocalTranscripts(prev => [...prev, `[You]: ${transcript}`]);
            await sendTranscript(callId, transcript, 'en-US');
          } catch (error) {
            console.error('Failed to auto-send transcript', error);
          }
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      // Assuming you still want to show interim text, we can update it if you add the state back.
      // For now we just safely ignore if interimTranscript state is removed, or we can add it back.
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
    };

    let isUnmounted = false;
    
    recognition.onend = () => {
      setIsListening(false);
      // Removed the automatic aggressive restart to prevent Chrome from permanently blocking it
      // if it conflicts with LiveKit. The user can now manually restart it.
    };

    try {
      recognition.start();
      setRecognitionInstance(recognition);
    } catch (e) {
      console.error('Failed to start recognition initially', e);
    }

    return () => {
      isUnmounted = true;
      recognition.stop();
    };
  }, [callId]);

  const toggleTranscription = () => {
    if (!recognitionInstance) return;
    if (isListening) {
      recognitionInstance.stop();
    } else {
      try {
        recognitionInstance.start();
      } catch (e) {
        console.error('Failed to manually start', e);
      }
    }
  };

  const handleEndCall = async () => {
    try {
      await endCall(callId);
      navigate('/');
    } catch (error) {
      console.error('Failed to end call', error);
      alert('Failed to end call');
    }
  };

  const handleSendTranscript = async () => {
    if (!transcriptText.trim()) return;
    try {
      await sendTranscript(callId, transcriptText);
      setLocalTranscripts(prev => [...prev, `[You]: ${transcriptText}`]);
      setTranscriptText('');
    } catch (error) {
      console.error('Failed to send transcript', error);
    }
  };

  if (!token) return <div className="p-8">Loading...</div>;

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Video Area */}
      <div className="flex-1 flex flex-col relative" data-lk-theme="default">
        <LiveKitRoom
          video={true}
          audio={true}
          token={token}
          serverUrl={import.meta.env.VITE_LIVEKIT_URL || (window.location.protocol === 'https:' ? 'wss://' : 'ws://') + window.location.host}
          onDisconnected={handleEndCall}
          className="h-full w-full"
        >
          <VideoConference />
          <RoomAudioRenderer />
        </LiveKitRoom>
      </div>

      {/* Sidebar for Transcripts */}
      <div className="w-80 bg-gray-800 border-l border-gray-700 p-4 flex flex-col">
        <h2 className="text-xl font-bold mb-4">Live Transcript</h2>
        <div className="flex-1 overflow-y-auto mb-4 bg-gray-900 p-2 rounded">
          <p className="text-sm text-gray-400 mb-2">Transcript saving is active. Type below to simulate a transcript chunk.</p>
          {localTranscripts.map((t, i) => (
            <div key={i} className="mb-2 bg-gray-800 p-2 rounded text-sm text-gray-200">
              {t}
            </div>
          ))}
          {interimTranscript && (
            <div className="mb-2 bg-gray-700 p-2 rounded text-sm text-gray-400 italic">
              [You speaking...]: {interimTranscript}
            </div>
          )}
          {/* Removed interim text rendering since we reverted that state, or you can leave it out */}
        </div>
        <div className="mt-auto">
          <button
            onClick={toggleTranscription}
            className={`w-full py-2 rounded mb-4 font-bold ${
              isListening ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'
            }`}
          >
            {isListening ? 'Transcription: Active (Click to Pause)' : 'Transcription: Paused (Click to Start)'}
          </button>
          
          <textarea
            className="w-full p-2 bg-gray-700 text-white rounded mb-2"
            rows="3"
            placeholder="Type transcript segment..."
            value={transcriptText}
            onChange={(e) => setTranscriptText(e.target.value)}
          ></textarea>
          <button
            onClick={handleSendTranscript}
            className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded mb-2"
          >
            Send Transcript
          </button>
          <button
            onClick={handleEndCall}
            className="w-full bg-red-600 hover:bg-red-700 py-2 rounded"
          >
            End Call
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoCall;
