import React from "react";
import FileUpload from "@/components/FileUpload";

export default function Home() {
  return (
    <div className="min-h-screen bg-emerald-50">
      <header className="p-4 flex items-center justify-between border-b border-emerald-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-medium">AI</span>
          </div>
          <span className="font-medium text-emerald-700">PDYFY</span>
        </div>
        <div className="text-sm text-emerald-600">PDF Chat Assistant</div>
      </header>

      {/* Main Content */}
      <main className="flex flex-col items-center justify-center min-h-[80vh] p-6">
        <div className="w-full max-w-2xl mx-auto bg-white rounded-lg shadow-lg border border-emerald-200 p-8">
          <h1 className="text-2xl font-bold text-emerald-700 mb-4 text-center">Upload Your PDF</h1>
          <p className="text-emerald-600 mb-6 text-center">Upload a document and start asking questions about its content</p>
          <FileUpload />
        </div>
      </main>
    </div>
  );
}