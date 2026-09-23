import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getTranscriptById, generateTranscriptSummary, chatWithTranscript } from '../api/transcriptApi';

const TranscriptDetail = () => {
  const { id } = useParams();
  const [transcript, setTranscript] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState(null);

  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [isChatting, setIsChatting] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    const fetchTranscript = async () => {
      try {
        const data = await getTranscriptById(id);
        setTranscript(data);
      } catch (err) {
        setError('Failed to fetch transcript details');
      } finally {
        setLoading(false);
      }
    };
    fetchTranscript();
  }, [id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleGenerateSummary = async () => {
    setGeneratingSummary(true);
    setSummaryError(null);
    try {
      const summaryText = await generateTranscriptSummary(id);
      setTranscript((prev) => ({ ...prev, summary: summaryText }));
    } catch (err) {
      setSummaryError('Failed to generate summary.');
    } finally {
      setGeneratingSummary(false);
    }
  };

  const handleDownloadDoc = (title, text) => {
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Export HTML To Doc</title></head><body>";
    const footer = "</body></html>";
    const sourceHTML = header + `<h1 style="font-family: Arial;">${title}</h1><p style="font-family: Arial; white-space: pre-wrap;">${text}</p>` + footer;

    const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
    const fileDownload = document.createElement("a");
    document.body.appendChild(fileDownload);
    fileDownload.href = source;
    fileDownload.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.doc`;
    fileDownload.click();
    document.body.removeChild(fileDownload);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage = chatInput.trim();
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setChatInput('');
    setIsChatting(true);

    try {
      const aiResponse = await chatWithTranscript(id, userMessage);
      setChatMessages(prev => [...prev, { role: 'ai', content: aiResponse }]);
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'error', content: 'Failed to get an answer. Please try again.' }]);
    } finally {
      setIsChatting(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;
  if (!transcript) return <div className="p-8">Transcript not found.</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <Link to="/transcripts" className="text-blue-500 hover:underline mb-4 inline-block">&larr; Back to Transcripts</Link>
      <div className="bg-white dark:bg-gray-800 p-6 rounded shadow mb-6 transition-colors duration-200">
        <div className="flex justify-between items-start mb-2">
          <h1 className="text-2xl font-bold dark:text-white">{transcript.title}</h1>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Created: {new Date(transcript.createdAt).toLocaleString()} | Call ID: {transcript.callId}
        </p>

        <div className="mb-8">
          <div className="flex items-center justify-between border-b dark:border-gray-700 pb-2 mb-4">
            <h2 className="text-lg font-semibold dark:text-gray-100">AI Summary</h2>
            <div className="flex space-x-2">
              {transcript.summary && (
                <button
                  onClick={() => handleDownloadDoc(`${transcript.title} - Summary`, transcript.summary)}
                  className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50"
                >
                  Download Summary (.doc)
                </button>
              )}
              {!transcript.summary && (
                <button
                  onClick={handleGenerateSummary}
                  disabled={generatingSummary}
                  className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded hover:bg-green-200 dark:hover:bg-green-900/50 disabled:opacity-50"
                >
                  {generatingSummary ? 'Generating...' : 'Generate Summary'}
                </button>
              )}
            </div>
          </div>
          
          {summaryError && <p className="text-red-500 mb-4">{summaryError}</p>}
          
          {transcript.summary ? (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded text-gray-800 dark:text-gray-200 whitespace-pre-wrap border border-blue-100 dark:border-blue-800 shadow-sm">
              {transcript.summary}
            </div>
          ) : (
            !generatingSummary && <p className="text-gray-500 italic">No summary generated yet.</p>
          )}
        </div>

        <div className="flex items-center justify-between border-b dark:border-gray-700 pb-2 mb-4">
          <h2 className="text-lg font-semibold dark:text-gray-100">Full Text</h2>
          {transcript.fullText && (
            <button
              onClick={() => handleDownloadDoc(`${transcript.title} - Full Transcript`, transcript.fullText)}
              className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50"
            >
              Download Full Transcript (.doc)
            </button>
          )}
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded mb-6 whitespace-pre-wrap text-gray-800 dark:text-gray-200">
          {transcript.fullText || "No text available."}
        </div>

        <h2 className="text-lg font-semibold mb-4 border-b dark:border-gray-700 pb-2 dark:text-gray-100">Segments</h2>
        {transcript.segments && transcript.segments.length > 0 ? (
          <div className="space-y-4">
            {transcript.segments.map((segment) => (
              <div key={segment.id} className="bg-gray-100 dark:bg-gray-700 p-3 rounded">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex justify-between">
                  <span>Speaker {segment.speakerId} ({segment.language})</span>
                  <span>{new Date(segment.startTime).toLocaleTimeString()}</span>
                </div>
                <p className="text-gray-800 dark:text-gray-200">{segment.text}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No individual segments found.</p>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded shadow transition-colors duration-200">
        <h2 className="text-xl font-bold mb-4 border-b dark:border-gray-700 pb-2 dark:text-white">Chat with Transcript</h2>
        <div className="h-64 overflow-y-auto mb-4 p-4 border dark:border-gray-700 rounded bg-gray-50 dark:bg-gray-900 flex flex-col space-y-4">
          {chatMessages.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center m-auto">Ask a question about this transcript!</p>
          ) : (
            chatMessages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-lg ${
                  msg.role === 'user' ? 'bg-blue-500 text-white rounded-br-none' : 
                  msg.role === 'error' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-bl-none' : 'bg-white dark:bg-gray-800 border dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'
                } whitespace-pre-wrap shadow-sm`}>
                  {msg.content}
                </div>
              </div>
            ))
          )}
          {isChatting && (
            <div className="flex justify-start">
              <div className="max-w-[80%] p-3 rounded-lg bg-white dark:bg-gray-800 border dark:border-gray-700 text-gray-500 dark:text-gray-400 rounded-bl-none shadow-sm">
                AI is typing...
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
        
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Ask something..."
            className="flex-1 p-2 border dark:border-gray-700 rounded focus:outline-none focus:ring focus:border-blue-300 dark:bg-gray-700 dark:text-white"
            disabled={isChatting}
          />
          <button 
            type="submit" 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            disabled={isChatting || !chatInput.trim()}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default TranscriptDetail;
