"use client";

import React from "react";
import type { ChatParams } from "@/app/types/chat";
import { useState, useRef, useEffect } from "react";
import { SendIcon } from "lucide-react";
import type Message from "@/app/types/message";

export default function Chat({ params }: { params: ChatParams }) {
  const { slug: chat_id } = React.use(params);

  const [documentId, setDocumentId] = useState<number | null>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello! I can help you analyze your document. What would you like to know?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    await sendMessage(input);
  };

  const sendMessage = async (message: string) => {
    const newMessage: Message = { role: "user", content: message };
    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setIsLoading(true);

    try {
      if (!documentId) {
        const documentIdResponse = await fetch("/api/getDocumentId", {
          method: "POST",
          body: JSON.stringify({ chat_id: chat_id }),
        });
        const documentIdData = await documentIdResponse.json();
        setDocumentId(documentIdData.documentId);
      }

      console.log(documentId);
      const response = await fetch("/api/sendMessage", {
        method: "POST",
        body: JSON.stringify({
          message: message,
          chat_id: chat_id,
          document_id: documentId,
        }),
      });

      const data = await response.json();
      const answer = data.answer;

      setMessages((prev) => [...prev, { role: "assistant", content: answer }]);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    "Summarize this Document",
    "Explain the Financials of this Company",
    "What is this document About?",
  ];

  return (
    <div className="bg-emerald-50 h-screen flex items-center justify-center">
      <div className="w-full max-w-7xl mx-auto h-[calc(100vh-2rem)] my-4 bg-white rounded-lg shadow-lg border border-emerald-200 flex flex-col">
        <div className="border-b border-emerald-200 p-4 flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white font-semibold">
            AI
          </div>
          <div>
            <h1 className="text-lg font-semibold text-emerald-700">
              AI Planet
            </h1>
            <p className="text-sm text-emerald-600">{`Document: ${chat_id}`}</p>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`rounded-lg px-4 py-2 max-w-[80%] ${
                    message.role === "user"
                      ? "bg-emerald-500 text-white"
                      : "bg-emerald-100 text-emerald-800"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="rounded-lg px-4 py-2 bg-emerald-100">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="border-t border-emerald-200 p-4 space-y-4">
          <div className="flex flex-wrap gap-2">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => sendMessage(action)}
                className="bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200"
              >
                {action}
              </button>
            ))}
          </div>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              placeholder="Send a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 px-3 py-2 border border-emerald-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-md px-4 py-2 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <SendIcon className="h-4 w-4" />
              <span className="sr-only">Send message</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
