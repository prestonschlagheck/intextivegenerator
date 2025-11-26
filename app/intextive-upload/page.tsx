"use client";

import * as React from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/primitives/Button";
import { cn } from "@/lib/utils";

type UploadState = "idle" | "loading" | "success" | "error";

interface WorkflowResponse {
  html: string;
}

export default function IntextiveUploadPage() {
  const [state, setState] = React.useState<UploadState>("idle");
  const [file, setFile] = React.useState<File | null>(null);
  const [instructions, setInstructions] = React.useState("");
  const [resultHtml, setResultHtml] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState("");
  const [pdfPreviewUrl, setPdfPreviewUrl] = React.useState<string>("");
  
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Cleanup PDF preview URL on unmount
  React.useEffect(() => {
    return () => {
      if (pdfPreviewUrl) {
        URL.revokeObjectURL(pdfPreviewUrl);
      }
    };
  }, [pdfPreviewUrl]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    
    if (!selectedFile) {
      setFile(null);
      setPdfPreviewUrl("");
      return;
    }

    // Validate file type
    if (selectedFile.type !== "application/pdf") {
      setErrorMessage("Please select a PDF file");
      setState("error");
      setFile(null);
      setPdfPreviewUrl("");
      return;
    }

    // Create preview URL
    if (pdfPreviewUrl) {
      URL.revokeObjectURL(pdfPreviewUrl);
    }
    const previewUrl = URL.createObjectURL(selectedFile);
    setPdfPreviewUrl(previewUrl);

    setFile(selectedFile);
    setErrorMessage("");
    if (state === "error") {
      setState("idle");
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    // Validate file is selected
    if (!file) {
      setErrorMessage("Please select a PDF file");
      setState("error");
      return;
    }

    setState("loading");
    setErrorMessage("");
    setResultHtml("");

    try {
      // Create form data
      const formData = new FormData();
      formData.append("file", file);
      formData.append("instructions", instructions);

      // Call our API route (which proxies to n8n)
      const response = await fetch("/api/run-workflow", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to process workflow");
      }

      const data: WorkflowResponse = await response.json();

      if (!data.html) {
        throw new Error("Invalid response: missing html content");
      }

      setResultHtml(data.html);
      setState("success");
    } catch (error) {
      console.error("Error running workflow:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
      setState("error");
    }
  };


  const handleCopyHtml = async () => {
    try {
      await navigator.clipboard.writeText(resultHtml);
      // Could add a toast notification here
    } catch (error) {
      console.error("Failed to copy HTML:", error);
    }
  };

  const handleDownloadHtml = () => {
    const blob = new Blob([resultHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `output-${Date.now()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-screen flex-col bg-bluewhale overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-bluewhale via-bluewhale/90 to-midnight opacity-90" />
        <div className="absolute -top-64 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-lagoon/25 blur-3xl" />
        <div className="absolute bottom-0 right-16 h-[380px] w-[380px] rounded-full bg-persian/20 blur-3xl" />
      </div>
      
      {/* Header */}
      <header className="flex-shrink-0 border-b border-white/10 bg-transparent">
        <div className="flex items-center justify-between px-8 py-2">
          <Image
            src="/Images/Logos/GLCLogo.png"
            alt="GLC logo"
            width={160}
            height={160}
            className="h-[100px] w-[100px] object-contain brightness-0 invert"
            priority
          />
          <h1 className="text-2xl font-bold text-white">Intextive Generator</h1>
          <div className="w-[100px]" /> {/* Spacer for centering */}
        </div>
      </header>

      {/* Main Content - Three Columns */}
      <main className="flex flex-1 gap-6 overflow-hidden p-6">
        {/* Box 1 - Upload & Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: 0 }}
          className="flex w-1/3 flex-col overflow-hidden rounded-lg border border-white/20 bg-white/10 shadow-xl backdrop-blur-xl"
        >
          <div className="flex-shrink-0 border-b border-white/20 px-6 py-4 text-center">
            <h2 className="text-lg font-semibold text-white">Upload</h2>
            <p className="text-sm text-white/70">Select PDF and add instructions</p>
          </div>
          <div className="flex-1 overflow-hidden p-6">
            <form onSubmit={handleSubmit} className="flex h-full flex-col">
                {/* File Input */}
                <div className="flex-shrink-0">
                  <label
                    htmlFor="file-upload"
                    className="mb-2 block text-sm font-medium text-white"
                  >
                    PDF File <span className="text-persian">*</span>
                  </label>
                  <input
                    ref={fileInputRef}
                    id="file-upload"
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    disabled={state === "loading"}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={state === "loading"}
                    className="w-full bg-persian text-white hover:bg-persian/90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Choose File
                  </Button>
                  {file && (
                    <p className="mt-2 text-sm text-white/70 truncate">
                      {file.name}
                    </p>
                  )}
                </div>

                {/* Instructions Textarea - Aligned to bottom */}
                <div className="flex-1 flex flex-col mt-4">
                  <label
                    htmlFor="instructions"
                    className="mb-2 block text-sm font-medium text-white"
                  >
                    Processing Instructions
                  </label>
                  <textarea
                    id="instructions"
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    disabled={state === "loading"}
                    placeholder="Add any specific instructions (optional)"
                    className={cn(
                      "block w-full flex-1 rounded-lg border border-white/30 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/50",
                      "focus:border-persian focus:outline-none focus:ring-2 focus:ring-persian/30",
                      "disabled:cursor-not-allowed disabled:opacity-50",
                      "transition-colors duration-200",
                      "resize-none"
                    )}
                  />
                </div>

                {/* Error Message */}
                <AnimatePresence mode="wait">
                  {state === "error" && errorMessage && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="mt-4 overflow-hidden rounded-lg border border-red-300/30 bg-red-500/10 px-4 py-3"
                    >
                      <p className="text-sm text-red-200">{errorMessage}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit Button */}
                <div className="flex-shrink-0 mt-4">
                  <Button
                    type="submit"
                    disabled={state === "loading" || !file}
                    className={cn(
                      "w-full bg-persian text-white hover:bg-persian/90",
                      "disabled:cursor-not-allowed disabled:opacity-50"
                    )}
                  >
                    {state === "loading" ? (
                      <>
                        <svg
                          className="mr-2 h-4 w-4 animate-spin"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Processing...
                      </>
                    ) : (
                      "Generate Output"
                    )}
                  </Button>
                </div>
              </form>
            </div>
        </motion.div>

        {/* Box 2 - Input Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          className="flex w-1/3 flex-col overflow-hidden rounded-lg border border-white/20 bg-white/10 shadow-xl backdrop-blur-xl"
        >
          <div className="flex-shrink-0 border-b border-white/20 px-6 py-4 text-center">
            <h2 className="text-lg font-semibold text-white">Input Preview</h2>
            <p className="text-sm text-white/70">
              {pdfPreviewUrl ? file?.name : "PDF preview will appear here"}
            </p>
          </div>
          <div className="flex-1 overflow-hidden flex flex-col">
            {pdfPreviewUrl ? (
              <>
                {/* Custom PDF Toolbar */}
                <div className="flex-shrink-0 flex items-center justify-between border-b border-white/20 bg-white/5 px-4 py-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="rounded p-1.5 text-white transition-colors hover:bg-persian/20 hover:text-persian"
                      title="Zoom out"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      className="rounded p-1.5 text-white transition-colors hover:bg-persian/20 hover:text-persian"
                      title="Zoom in"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                    </button>
                  </div>
                  <span className="text-xs text-white">PDF Document</span>
                  <button
                    type="button"
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = pdfPreviewUrl;
                      link.download = file?.name || 'document.pdf';
                      link.click();
                    }}
                    className="rounded p-1.5 text-white transition-colors hover:bg-persian/20 hover:text-persian"
                    title="Download PDF"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </button>
                </div>
                <iframe
                  src={`${pdfPreviewUrl}#toolbar=0&navpanes=0&scrollbar=1`}
                  className="flex-1 w-full"
                  title="PDF Preview"
                />
              </>
            ) : (
              <div className="flex h-full items-center justify-center p-6">
                <div className="text-center">
                  <svg
                    className="mx-auto mb-4 h-16 w-16 text-white/30"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p className="text-white/50">Upload a PDF to preview</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Box 3 - Output Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          className="flex w-1/3 flex-col overflow-hidden rounded-lg border border-white/20 bg-white/10 shadow-xl backdrop-blur-xl"
        >
          <div className="flex flex-shrink-0 items-center justify-between border-b border-white/20 px-6 py-4">
            <div className="flex-1 text-center">
              <h2 className="text-lg font-semibold text-white">Output Preview</h2>
              <p className="text-sm text-white/70">
                {resultHtml ? "Generated output" : "Output will appear here"}
              </p>
            </div>
            {resultHtml && (
              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={handleCopyHtml}
                  variant="secondary"
                  size="sm"
                  className="border-white/30 bg-white/5 text-white hover:bg-white/10"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </Button>
                <Button
                  type="button"
                  onClick={handleDownloadHtml}
                  variant="secondary"
                  size="sm"
                  className="border-white/30 bg-white/5 text-white hover:bg-white/10"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                </Button>
              </div>
            )}
          </div>
          <div className="flex-1 overflow-hidden relative">
            {state === "loading" ? (
              <div className="flex h-full items-center justify-center p-6">
                <div className="text-center">
                  <svg
                    className="mx-auto mb-4 h-12 w-12 animate-spin text-persian"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <p className="text-white font-medium">Processing file...</p>
                </div>
              </div>
            ) : resultHtml ? (
              <iframe
                srcDoc={resultHtml}
                className="h-full w-full bg-white"
                title="Output Preview"
                sandbox="allow-same-origin allow-scripts"
              />
            ) : (
              <div className="flex h-full items-center justify-center p-6">
                <div className="text-center">
                  <svg
                    className="mx-auto mb-4 h-16 w-16 text-white/30"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p className="text-white/50">Generate output to preview</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
}

