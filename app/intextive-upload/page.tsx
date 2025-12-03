"use client";

import * as React from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/primitives/Button";
import { cn } from "@/lib/utils";

type UploadState = "idle" | "loading" | "success" | "error";
type Step = "upload" | "email" | "instructions" | "review" | "processing";

export default function IntextiveUploadPage() {
  const [currentStep, setCurrentStep] = React.useState<Step>("upload");
  const [state, setState] = React.useState<UploadState>("idle");
  const [file, setFile] = React.useState<File | null>(null);
  const [instructions, setInstructions] = React.useState("");
  const [emails, setEmails] = React.useState("");
  const [emailList, setEmailList] = React.useState<string[]>([]);
  const [errorMessage, setErrorMessage] = React.useState("");
  const [pdfPreviewUrl, setPdfPreviewUrl] = React.useState<string>("");
  const [countdown, setCountdown] = React.useState(300); // 5 minutes in seconds
  
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Cleanup PDF preview URL on unmount
  React.useEffect(() => {
    return () => {
      if (pdfPreviewUrl) {
        URL.revokeObjectURL(pdfPreviewUrl);
      }
    };
  }, [pdfPreviewUrl]);

  // Countdown timer for processing step
  React.useEffect(() => {
    if (currentStep === "processing" && countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => Math.max(0, prev - 1));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [currentStep, countdown]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

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

  const handleNextFromUpload = () => {
    if (!file) {
      setErrorMessage("Please select a PDF file");
      setState("error");
      return;
    }
    setErrorMessage("");
    setCurrentStep("email");
  };

  const handleNextFromEmail = () => {
    const parsedEmails = emails
      .split(/[,;\n]/)
      .map((email) => email.trim())
      .filter((email) => email.length > 0);

    if (parsedEmails.length === 0) {
      setErrorMessage("Please enter at least one email address");
      setState("error");
      return;
    }

    setEmailList(parsedEmails);
    setErrorMessage("");
    setCurrentStep("instructions");
  };

  const handleNextFromInstructions = () => {
    setErrorMessage("");
    setCurrentStep("review");
  };

  const handleSubmit = async () => {
    if (!file || emailList.length === 0) {
      setErrorMessage("Missing required information");
      setState("error");
      return;
    }

    setState("loading");
    setErrorMessage("");

    try {
      // Create form data
      const formData = new FormData();
      formData.append("file", file);
      formData.append("instructions", instructions);
      formData.append("emails", JSON.stringify(emailList));

      // Call our API route (which proxies to n8n)
      const response = await fetch("/api/run-workflow", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        let errorMessage = "Failed to process workflow";
        let errorCode = "UNKNOWN_ERROR";
        let errorDetails = "";
        let troubleshooting: string[] = [];
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
          errorCode = errorData.errorCode || errorCode;
          errorDetails = errorData.details || errorData.details || "";
          troubleshooting = errorData.troubleshooting || [];
        } catch {
          // If response is not JSON, use status text
          errorMessage = response.statusText || errorMessage;
        }
        
        // Format error message with code and details
        const formattedError = troubleshooting.length > 0
          ? `${errorMessage}\n\nError Code: ${errorCode}\n\n${errorDetails}\n\nTroubleshooting:\n${troubleshooting.map((item, i) => `${i + 1}. ${item}`).join("\n")}`
          : errorDetails
          ? `${errorMessage}\n\nError Code: ${errorCode}\n\n${errorDetails}`
          : `${errorMessage}\n\nError Code: ${errorCode}`;
        
        throw new Error(formattedError);
      }

      setState("success");
      setCountdown(300); // Reset countdown
      setCurrentStep("processing");
    } catch (error) {
      console.error("Error running workflow:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
      setState("error");
    }
  };

  const handleReplaceFile = () => {
    fileInputRef.current?.click();
  };

  const steps: Step[] = ["upload", "email", "instructions", "review", "processing"];
  const stepLabels = {
    upload: "Upload",
    email: "Email Recipients",
    instructions: "Processing Instructions",
    review: "Review",
    processing: "Processing"
  };
  const currentStepIndex = steps.indexOf(currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  return (
    <div className="flex h-screen flex-col bg-bluewhale overflow-hidden relative">
      {/* Background Effects */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-bluewhale via-bluewhale/90 to-midnight opacity-90" />
        <div className="absolute -top-64 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-lagoon/25 blur-3xl" />
        <div className="absolute bottom-0 right-16 h-[380px] w-[380px] rounded-full bg-persian/20 blur-3xl" />
      </div>
      
      {/* Header */}
      <header className="flex-shrink-0 border-b border-white/10 bg-transparent relative z-10">
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

      {/* Progress Bar */}
      <div className="flex-shrink-0 bg-white/5 px-8 py-4 relative z-10">
        <div className="mx-auto max-w-4xl">
          <div className="mb-2 flex items-center justify-between text-sm text-white/70">
            {steps.map((step, index) => (
              <div
                key={step}
                className={cn(
                  "flex items-center gap-2 transition-colors",
                  index <= currentStepIndex ? "text-white font-medium" : "text-white/50"
                )}
              >
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors",
                    index < currentStepIndex
                      ? "border-persian bg-persian text-white"
                      : index === currentStepIndex
                      ? "border-persian bg-persian/20 text-white"
                      : "border-white/30 bg-white/5 text-white/50"
                  )}
                >
                  {index < currentStepIndex ? (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                <span className="hidden sm:inline">{stepLabels[step]}</span>
              </div>
            ))}
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full bg-gradient-to-r from-persian to-lagoon"
              initial={{ width: "0%" }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex flex-1 overflow-hidden p-8 relative z-10" style={{ minHeight: 0 }}>
        <div className="mx-auto w-full max-w-4xl">
          <AnimatePresence mode="wait">
            {/* Step 1: Upload */}
            {currentStep === "upload" && (
              <motion.div
                key="upload"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="flex h-full flex-col overflow-hidden rounded-lg border border-white/20 bg-white/10 shadow-xl backdrop-blur-xl"
              >
                <div className="flex-shrink-0 border-b border-white/20 px-6 py-4">
                  <h2 className="text-xl font-semibold text-white">Upload PDF</h2>
                  <p className="text-sm text-white/70">Choose the file you want to process</p>
                </div>
                <div className="flex-1 overflow-hidden p-6 flex flex-col">
                  {/* File Input */}
                  <div className="flex-shrink-0 mb-4">
                    <label className="mb-2 block text-sm font-medium text-white">
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
                        Selected: {file.name}
                      </p>
                    )}
                  </div>

                  {/* PDF Preview */}
                  {pdfPreviewUrl && (
                    <div className="flex-1 overflow-hidden rounded-lg border border-white/20 bg-white/5 mb-4 flex flex-col">
                      <div className="flex-shrink-0 flex items-center justify-between border-b border-white/20 bg-white/5 px-4 py-2">
                        <span className="text-xs text-white">PDF Preview</span>
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
                      <div className="flex-1 relative" style={{ touchAction: 'pan-y' }}>
                        <iframe
                          src={`${pdfPreviewUrl}#toolbar=0&navpanes=0&scrollbar=1&zoom=page-fit`}
                          className="absolute inset-0 w-full h-full"
                          title="PDF Preview"
                          style={{ 
                            pointerEvents: 'auto',
                            touchAction: 'pan-y'
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Error Message */}
                  {state === "error" && errorMessage && (
                    <div className="flex-shrink-0 rounded-lg border border-red-300/30 bg-red-500/10 px-4 py-3">
                      <div className="text-sm text-red-200">{errorMessage}</div>
                    </div>
                  )}
                </div>
                <div className="flex-shrink-0 border-t border-white/20 px-6 py-4">
                  <Button
                    onClick={handleNextFromUpload}
                    disabled={!file}
                    className="w-full bg-persian text-white hover:bg-persian/90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next: Email Recipients
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Email Recipients */}
            {currentStep === "email" && (
              <motion.div
                key="email"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="flex h-full flex-col overflow-hidden rounded-lg border border-white/20 bg-white/10 shadow-xl backdrop-blur-xl"
              >
                <div className="flex-shrink-0 border-b border-white/20 px-6 py-4">
                  <h2 className="text-xl font-semibold text-white">Email Recipients</h2>
                  <p className="text-sm text-white/70">Who should receive the output?</p>
                </div>
                <div className="flex-1 overflow-auto p-6">
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="emails" className="mb-2 block text-sm font-medium text-white">
                        Email Addresses <span className="text-persian">*</span>
                      </label>
                      <textarea
                        id="emails"
                        value={emails}
                        onChange={(e) => setEmails(e.target.value)}
                        placeholder="Enter one or more emails separated by commas, semicolons, or new lines"
                        className={cn(
                          "block w-full rounded-lg border border-white/30 bg-white px-4 py-3 text-sm text-bluewhale placeholder:text-bluewhale/50",
                          "focus:border-persian focus:outline-none focus:ring-2 focus:ring-persian/30",
                          "transition-colors duration-200",
                          "resize-none"
                        )}
                        rows={6}
                      />
                      <p className="mt-2 text-xs text-white/70">
                        The generated HTML will be emailed to each address above.
                      </p>
                    </div>

                    {/* Error Message */}
                    {state === "error" && errorMessage && (
                      <div className="rounded-lg border border-red-300/30 bg-red-500/10 px-4 py-3">
                        <div className="text-sm text-red-200">{errorMessage}</div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex-shrink-0 border-t border-white/20 px-6 py-4 flex gap-3">
                  <Button
                    onClick={() => setCurrentStep("upload")}
                    className="flex-1 bg-white/10 text-white hover:bg-white/20 border border-white/30"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleNextFromEmail}
                    className="flex-1 bg-persian text-white hover:bg-persian/90"
                  >
                    Next: Instructions
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Processing Instructions */}
            {currentStep === "instructions" && (
              <motion.div
                key="instructions"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="flex h-full flex-col overflow-hidden rounded-lg border border-white/20 bg-white/10 shadow-xl backdrop-blur-xl"
              >
                <div className="flex-shrink-0 border-b border-white/20 px-6 py-4">
                  <h2 className="text-xl font-semibold text-white">Processing Instructions</h2>
                  <p className="text-sm text-white/70">Add any specific instructions (optional)</p>
                </div>
                <div className="flex-1 overflow-auto p-6">
                  <div className="space-y-4">
                    <div className="flex flex-col h-full">
                      <label htmlFor="instructions" className="mb-2 block text-sm font-medium text-white">
                        Instructions
                      </label>
                      <textarea
                        id="instructions"
                        value={instructions}
                        onChange={(e) => setInstructions(e.target.value)}
                        placeholder="Add any specific instructions for processing the PDF (optional)"
                        className={cn(
                          "block w-full flex-1 rounded-lg border border-white/30 bg-white px-4 py-3 text-sm text-bluewhale placeholder:text-bluewhale/50",
                          "focus:border-persian focus:outline-none focus:ring-2 focus:ring-persian/30",
                          "transition-colors duration-200",
                          "resize-none min-h-[300px]"
                        )}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex-shrink-0 border-t border-white/20 px-6 py-4 flex gap-3">
                  <Button
                    onClick={() => setCurrentStep("email")}
                    className="flex-1 bg-white/10 text-white hover:bg-white/20 border border-white/30"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleNextFromInstructions}
                    className="flex-1 bg-persian text-white hover:bg-persian/90"
                  >
                    Next: Review
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 4: Review */}
            {currentStep === "review" && (
              <motion.div
                key="review"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="flex h-full flex-col overflow-hidden rounded-lg border border-white/20 bg-white/10 shadow-xl backdrop-blur-xl"
              >
                <div className="flex-shrink-0 border-b border-white/20 px-6 py-4">
                  <h2 className="text-xl font-semibold text-white">Review & Submit</h2>
                  <p className="text-sm text-white/70">Review your submission before processing</p>
                </div>
                <div className="flex-1 overflow-auto p-6">
                  <div className="space-y-6">
                    {/* File Info */}
                    <div className="rounded-lg border border-white/20 bg-white/5 p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-white">PDF File</h3>
                        <Button
                          onClick={handleReplaceFile}
                          className="text-xs bg-white/10 text-white hover:bg-white/20 px-3 py-1"
                        >
                          Replace
                        </Button>
                      </div>
                      <p className="text-sm text-white">{file?.name}</p>
                      {pdfPreviewUrl && (
                        <div className="mt-3 overflow-hidden rounded border border-white/20">
                          <iframe
                            src={`${pdfPreviewUrl}#toolbar=0&navpanes=0&scrollbar=1`}
                            className="h-48 w-full"
                            title="PDF Preview"
                          />
                        </div>
                      )}
                    </div>

                    {/* Email Recipients */}
                    <div className="rounded-lg border border-white/20 bg-white/5 p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-white">Email Recipients</h3>
                        <Button
                          onClick={() => setCurrentStep("email")}
                          className="text-xs bg-white/10 text-white hover:bg-white/20 px-3 py-1"
                        >
                          Edit
                        </Button>
                      </div>
                      <ul className="space-y-1 text-sm text-white">
                        {emailList.map((email, index) => (
                          <li key={index}>• {email}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Processing Instructions */}
                    <div className="rounded-lg border border-white/20 bg-white/5 p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-white">Processing Instructions</h3>
                        <Button
                          onClick={() => setCurrentStep("instructions")}
                          className="text-xs bg-white/10 text-white hover:bg-white/20 px-3 py-1"
                        >
                          Edit
                        </Button>
                      </div>
                      <p className="text-sm text-white">
                        {instructions || <em className="text-white/70">No specific instructions provided</em>}
                      </p>
                    </div>

                    {/* Error Message */}
                    {state === "error" && errorMessage && (
                      <div className="rounded-lg border border-red-300/30 bg-red-500/10 px-4 py-3">
                        <div className="text-sm text-red-200 whitespace-pre-line">
                          {errorMessage.split("\n").map((line, i) => {
                            if (line.startsWith("Error Code:")) {
                              return (
                                <div key={i} className="mt-2 font-semibold text-red-100">
                                  {line}
                                </div>
                              );
                            }
                            if (line.startsWith("Troubleshooting:")) {
                              return (
                                <div key={i} className="mt-3 font-semibold text-red-100">
                                  {line}
                                </div>
                              );
                            }
                            if (/^\d+\./.test(line)) {
                              return (
                                <div key={i} className="ml-4 mt-1 text-red-200">
                                  {line}
                                </div>
                              );
                            }
                            return (
                              <div key={i} className={i === 0 ? "font-semibold text-red-100" : "text-red-200"}>
                                {line}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex-shrink-0 border-t border-white/20 px-6 py-4 flex gap-3">
                  <Button
                    onClick={() => setCurrentStep("instructions")}
                    disabled={state === "loading"}
                    className="flex-1 bg-white/10 text-white hover:bg-white/20 border border-white/30 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={state === "loading"}
                    className="flex-1 bg-persian text-white hover:bg-persian/90 disabled:cursor-not-allowed disabled:opacity-50"
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
                        Submitting...
                      </>
                    ) : (
                      "Submit"
                    )}
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 5: Processing Status */}
            {currentStep === "processing" && (
              <motion.div
                key="processing"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="flex h-full flex-col overflow-hidden rounded-lg border border-white/20 bg-white/10 shadow-xl backdrop-blur-xl"
              >
                <div className="flex-shrink-0 border-b border-white/20 px-6 py-4">
                  <h2 className="text-xl font-semibold text-white">Processing Your Request</h2>
                  <p className="text-sm text-white/70">Your PDF is being processed</p>
                </div>
                <div className="flex-1 overflow-auto p-6 flex items-center justify-center">
                  <div className="max-w-md text-center space-y-6">
                    {/* Animated Spinner */}
                    <div className="flex justify-center">
                      <svg
                        className="h-16 w-16 animate-spin text-persian"
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
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-3">
                      <div className="rounded-lg border border-white/20 bg-white/5 p-6">
                        <p className="text-sm text-white/70 mb-4">Estimated time remaining</p>
                        <div className="relative">
                          <div className="h-4 w-full overflow-hidden rounded-full bg-white/10">
                            <motion.div
                              className="h-full bg-gradient-to-r from-persian to-lagoon"
                              initial={{ width: "100%" }}
                              animate={{ width: `${(countdown / 300) * 100}%` }}
                              transition={{ duration: 0.5, ease: "linear" }}
                            />
                          </div>
                          <div className="mt-2 text-center text-lg font-semibold text-white">
                            {formatTime(countdown)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Message */}
                    <div className="space-y-3">
                      <p className="text-white">
                        Your output will be emailed to:
                      </p>
                      <div className="rounded-lg border border-white/20 bg-white/5 p-4">
                        <ul className="space-y-1 text-sm text-white">
                          {emailList.map((email, index) => (
                            <li key={index}>• {email}</li>
                          ))}
                        </ul>
                      </div>
                      <p className="text-sm text-white/70">
                        You can safely close this page. We&apos;ll send you an email when processing is complete.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex-shrink-0 border-t border-white/20 px-6 py-4">
                  <Button
                    onClick={() => {
                      setCurrentStep("upload");
                      setState("idle");
                      setFile(null);
                      setEmails("");
                      setEmailList([]);
                      setInstructions("");
                      setPdfPreviewUrl("");
                      setErrorMessage("");
                      setCountdown(300);
                    }}
                    disabled={countdown > 0}
                    className="w-full bg-white/10 text-white hover:bg-white/20 border border-white/30 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {countdown > 0 ? "Processing..." : "Process Another File"}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
