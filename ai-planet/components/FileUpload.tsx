"use client";
import { ChangeEvent, useState } from "react";
import { toast } from "react-hot-toast";
import axios from "axios";
import { redirect } from "next/navigation";
import { FileCheck, Upload, CheckCircle } from "lucide-react";

export default function FileUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [presignedUrl, setPresignedUrl] = useState("");
  const [chatId, setChatId] = useState("");
  const [fileAdded, setFileAdded] = useState(false);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (file) {
        setFileAdded(true);
        const presignedUrl = await axios.post("/api/uploadFile", {
          file_name: file.name,
        });
        setFile(file);
        setPresignedUrl(presignedUrl.data.presignedUrl);
        setChatId(presignedUrl.data.chatId);
        setFileAdded(false);
      }
    } catch (error) {
      setFileAdded(false);
      setFile(null);
      toast.error(`Failed to upload file: ${error}`);
      console.error(error);
    }
  };

  const handleUpload = async () => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("file", file as Blob);
      const response = await fetch(presignedUrl, {
        method: "PUT",
        body: formData,
      });

      const uploadFormData = new FormData();
      uploadFormData.append("file", file as Blob);
      uploadFormData.append("chat_id", chatId);

      const uploadResponse = await axios.post(
        "/api/uploadBackend",
        uploadFormData
      );

      if (response.ok && uploadResponse.data.success) {
        toast.success("File uploaded successfully");
        console.log("File uploaded successfully");
      }
      if (!response.ok || !uploadResponse.data.success) {
        toast.error("Failed to upload file");
        console.error("Failed to upload file");
      }
    } catch (error) {
      toast.error(`Failed to upload file: ${error}`);
      console.error(error);
    } finally {
      setLoading(false);
      redirect(`/redirect/${chatId}`);
    }
  };
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center ">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 flex flex-col items-center space-y-6">
          <div className="p-6 bg-emerald-50 rounded-full">
            <svg
              className="w-16 h-16 text-emerald-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>

          <div className="space-y-2 text-center">
            <h3 className="text-2xl font-semibold text-gray-900">
              Uploading your file...
            </h3>
            <p className="text-lg text-gray-500">This may take a moment</p>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-emerald-500 h-2 rounded-full animate-progress"></div>
          </div>

          <p className="text-lg text-gray-500 animate-pulse">
            Please wait while we process your file
          </p>
        </div>
      </div>
    );
  }

  if (fileAdded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 flex flex-col items-center space-y-6">
          <div className="p-6 bg-emerald-50 rounded-full">
            <FileCheck className="w-16 h-16 text-emerald-500" />
          </div>

          <div className="space-y-2 text-center">
            <h3 className="text-2xl font-semibold text-gray-900">
              Checking your File...
            </h3>
            <p className="text-lg text-gray-500">
              This will only take a moment
            </p>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-emerald-500 h-2 rounded-full w-1/2 animate-pulse"></div>
          </div>

          <p className="text-lg text-gray-500">
            Verifying file integrity and safety
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-4">
      {!file ? (
        <>
          <div className="p-4 bg-emerald-50 rounded-full">
            <Upload className="w-8 h-8 text-emerald-500" />
          </div>
          <div className="flex flex-col items-center space-y-4 text-center">
            <h2 className="text-xl font-semibold text-gray-700">
              Upload a PDF to get started
            </h2>
            <p className="text-sm text-gray-500">
              Choose a PDF file to upload and analyze
            </p>

            <label className="px-6 py-3 text-sm font-medium text-white bg-emerald-500 rounded-full hover:bg-emerald-600 cursor-pointer transition-colors duration-200">
              Choose File
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>
          <div className="absolute left-0 right-0 bottom-4 text-xs text-gray-500 text-center">
            <p>
              Max file size: 30MB
              <br />
              Supported formats: PDF
              <br />
              PDFs with Images might not work as intended
              <br />
            </p>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center space-y-6 w-full">
          <div className="p-6 bg-emerald-50 rounded-full">
            <CheckCircle className="w-16 h-16 text-emerald-500" />
          </div>
          <div className="flex flex-col items-center space-y-4 text-center">
            <h2 className="text-2xl font-semibold text-gray-700">
              File Selected
            </h2>
            <p className="text-lg text-gray-600">You have selected the file:</p>
            <p className="text-xl font-medium text-emerald-600 break-all">
              {file.name}
            </p>
          </div>
          <button
            onClick={handleUpload}
            disabled={loading}
            className="w-full px-8 py-4 text-lg font-medium text-white bg-emerald-500 rounded-full hover:bg-emerald-600 disabled:bg-emerald-300 disabled:cursor-not-allowed transition-colors duration-200 shadow-md"
          >
            {loading ? "Uploading..." : "Confirm Upload"}
          </button>
        </div>
      )}
    </div>
  );
}
