"use client";
import React from "react";
import { useState, useEffect } from "react";
import { CheckCircle, ArrowRight } from "lucide-react";
import { redirect } from "next/navigation";
import toast from "react-hot-toast";
import type { PageParams } from "@/app/types/redirect";

export default function Redirect({ params }: { params: PageParams }) {
  const [countdown, setCountdown] = useState(5);
  const { url: redirectUrl } = React.use(params);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prevCount) => {
        if (prevCount <= 1) {
          clearInterval(timer);
          toast.success("Redirecting...");
          redirect(`/chat/${redirectUrl}`);
          return 0;
        }
        return prevCount - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRedirectNow = () => {
    clearInterval(countdown);
    toast.success("Redirecting immediately...");
    redirect(`/chat/${redirectUrl}`);
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 flex flex-col items-center space-y-6">
        <CheckCircle className="w-16 h-16 text-emerald-500" />

        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold text-gray-900">
            Congratulations
          </h1>
          <p className="text-lg text-gray-700">
            Your file has been uploaded and is being processed.
          </p>
        </div>

        <div className="w-full bg-emerald-100 rounded-full h-2.5">
          <div
            className="bg-emerald-500 h-2.5 rounded-full transition-all duration-1000 ease-linear"
            style={{ width: `${(countdown / 5) * 100}%` }}
          ></div>
        </div>

        <p className="text-sm text-gray-500">
          You are being redirected in{" "}
          <span className="font-medium">{countdown}</span> seconds
        </p>

        <button
          onClick={handleRedirectNow}
          className="bg-emerald-500 hover:bg-emerald-600 text-white py-2 px-4 rounded-md transition-colors duration-200 ease-in-out flex items-center justify-center space-x-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-50"
        >
          <span>Redirect now</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
