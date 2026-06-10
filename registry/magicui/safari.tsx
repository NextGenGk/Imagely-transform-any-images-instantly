"use client";

import { cn } from "@/lib/utils";

interface SafariProps {
  url?: string;
  videoSrc?: string;
  className?: string;
}

export function Safari({ url = "", videoSrc, className }: SafariProps) {
  return (
    <div className={cn("relative rounded-xl overflow-hidden bg-white shadow-xl", className)}>
      <div className="flex items-center gap-2 px-4 py-3 bg-gray-100 border-b border-gray-200">
        <div className="flex gap-1.5">
          <div className="size-3 rounded-full bg-red-500" />
          <div className="size-3 rounded-full bg-yellow-500" />
          <div className="size-3 rounded-full bg-green-500" />
        </div>
        <div className="flex-1 mx-4">
          <div className="bg-white rounded-md px-3 py-1.5 text-xs text-gray-500 border border-gray-200 text-center truncate">
            {url || "localhost"}
          </div>
        </div>
        <div className="flex gap-1.5">
          <div className="size-3 rounded-full bg-gray-300" />
          <div className="size-3 rounded-full bg-gray-300" />
          <div className="size-3 rounded-full bg-gray-300" />
        </div>
      </div>
      <div className="bg-gray-900">
        {videoSrc ? (
          <video
            src={videoSrc}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
            No video source
          </div>
        )}
      </div>
    </div>
  );
}
