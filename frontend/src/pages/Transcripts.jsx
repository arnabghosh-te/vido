import React, { useEffect, useState } from 'react';
import { getTranscripts, deleteTranscript, generateTranscriptSummary } from '../api/transcriptApi';
import { Link } from 'react-router-dom';

const Transcripts = () => {
  const [transcripts, setTranscripts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summaryModal, setSummaryModal] = useState({ isOpen: false, text: '', loading: false });

  const fetchTranscripts = async () => {
    try {
      const data = await getTranscripts();
      setTranscripts(data);
    } catch (err) {
      setError('Failed to fetch transcripts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTranscripts();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this transcript?')) {
      try {
        await deleteTranscript(id);
        fetchTranscripts();
      } catch (err) {
        alert('Failed to delete transcript');
      }
    }
  };

  const handleGenerateSummary = async (id) => {
    setSummaryModal({ isOpen: true, text: '', loading: true });
    try {
      const summary = await generateTranscriptSummary(id);
      setSummaryModal({ isOpen: true, text: summary, loading: false });
    } catch (err) {
      setSummaryModal({ isOpen: true, text: 'Failed to generate summary.', loading: false });
    }
  };

  if (loading) return <div className="p-8 text-gray-900 dark:text-white">Loading transcripts...</div>;
  if (error) return <div className="p-8 text-red-500 dark:text-red-400">{error}</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto text-gray-900 dark:text-white transition-colors duration-200">
      <h1 className="text-3xl font-bold mb-6">Your Transcripts</h1>
      {transcripts.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No transcripts found.</p>
      ) : (
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md transition-colors duration-200">
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {transcripts.map((transcript) => (
              <li key={transcript.id}>
                <div className="px-4 py-4 flex items-center justify-between sm:px-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                  <div className="flex flex-col">
                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400 truncate">{transcript.title}</p>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 text-xs">
                      Date: {new Date(transcript.createdAt).toLocaleString()} | Call ID: {transcript.callId} | Language: {transcript.language}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Link
                      to={`/transcripts/${transcript.id}`}
                      className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded hover:bg-blue-200 dark:hover:bg-blue-800/50 transition-colors"
                    >
                      View
                    </Link>
                    <button
                      onClick={() => handleGenerateSummary(transcript.id)}
                      className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded hover:bg-green-200 dark:hover:bg-green-800/50 transition-colors"
                    >
                      Summary
                    </button>
                    <button
                      onClick={() => handleDelete(transcript.id)}
                      className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-800/50 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Summary Modal */}
      {summaryModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto transition-colors duration-200">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Transcript Summary</h2>
            {summaryModal.loading ? (
              <p className="text-gray-600 dark:text-gray-400">Generating AI summary with Gemini, please wait...</p>
            ) : (
              <div className="whitespace-pre-wrap text-gray-800 dark:text-gray-200">{summaryModal.text}</div>
            )}
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSummaryModal({ isOpen: false, text: '', loading: false })}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transcripts;
