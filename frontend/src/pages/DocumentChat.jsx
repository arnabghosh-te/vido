import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const DocumentChat = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await axios.get("/api/documents");
      setDocuments(res.data.data);
    } catch (err) {
      console.error("Error fetching documents", err);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("document", file);

    setIsUploading(true);
    try {
      const res = await axios.post("/api/documents/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setDocuments([res.data.data, ...documents]);
      setSelectedDocument(res.data.data);
      setMessages([]);
    } catch (err) {
      console.error("Upload error", err);
      alert("Failed to upload document");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !selectedDocument) return;

    const userMsg = { role: "user", text: input };
    setMessages([...messages, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await axios.post("/api/documents/query", {
        documentId: selectedDocument.id,
        question: userMsg.text,
      });

      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: res.data.data.answer,
        },
      ]);
    } catch (err) {
      console.error("Query error", err);
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "Sorry, I encountered an error answering that." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            My Documents
          </h2>
          <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md w-full text-center block transition-colors">
            {isUploading ? "Uploading..." : "Upload Document"}
            <input
              type="file"
              className="hidden"
              accept=".pdf,.txt"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
          </label>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {documents.map((doc) => (
            <div
              key={doc.id}
              onClick={() => {
                setSelectedDocument(doc);
                setMessages([]);
              }}
              className={`p-3 rounded-md cursor-pointer mb-2 truncate ${selectedDocument?.id === doc.id ? "bg-blue-100 text-blue-700 font-medium" : "hover:bg-gray-100 text-gray-700"}`}
            >
              {doc.originalName}
            </div>
          ))}
          {documents.length === 0 && (
            <p className="text-gray-500 text-sm text-center mt-4">
              No documents uploaded yet.
            </p>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedDocument ? (
          <>
            <div className="p-4 border-b border-gray-200 bg-white">
              <h3 className="font-semibold text-gray-800">
                Chatting with: {selectedDocument.originalName}
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 mt-10">
                  Ask a question about this document to get started.
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] p-3 rounded-lg ${msg.role === "user" ? "bg-blue-600 text-white rounded-br-none" : "bg-white border border-gray-200 text-gray-800 rounded-bl-none"}`}
                    >
                      <p className="whitespace-pre-wrap text-sm">{msg.text}</p>
                    </div>
                  </div>
                ))
              )}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 text-gray-500 p-3 rounded-lg rounded-bl-none text-sm animate-pulse">
                    Thinking...
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-white border-t border-gray-200">
              <form onSubmit={handleSendMessage} className="flex space-x-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask anything about the document..."
                  className="flex-1 border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md disabled:opacity-50 transition-colors"
                >
                  Send
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select or upload a document to start chatting.
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentChat;
