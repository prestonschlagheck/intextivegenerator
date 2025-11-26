import { NextRequest, NextResponse } from "next/server";

/**
 * API route that proxies PDF upload requests to the n8n webhook.
 * This avoids CORS issues by handling the request server-side.
 */
export async function POST(request: NextRequest) {
  try {
    // Get the n8n webhook URL from environment variables
    const webhookUrl = process.env.N8N_WEBHOOK_URL;

    if (!webhookUrl) {
      return NextResponse.json(
        { error: "N8N_WEBHOOK_URL is not configured" },
        { status: 500 }
      );
    }

    // Parse the incoming form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const instructions = formData.get("instructions") as string | null;

    // Validate the file
    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are allowed" },
        { status: 400 }
      );
    }

    // Forward the request to n8n
    const n8nFormData = new FormData();
    n8nFormData.append("file", file);
    n8nFormData.append("instructions", instructions || "");

    console.log("Calling n8n webhook:", webhookUrl);
    
    let response;
    try {
      response = await fetch(webhookUrl, {
        method: "POST",
        body: n8nFormData,
        headers: {
          // Don't set Content-Type - let fetch set it automatically for FormData
        },
      });
    } catch (fetchError) {
      console.error("Network error calling n8n webhook:", fetchError);
      return NextResponse.json(
        { 
          error: `Failed to connect to webhook: ${fetchError instanceof Error ? fetchError.message : "Network error"}. Please check the webhook URL is correct and accessible.` 
        },
        { status: 503 }
      );
    }

    if (!response.ok) {
      let errorMessage = `Workflow failed: ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch {
        // If response is not JSON, try to get text
        try {
          const errorText = await response.text();
          if (errorText) {
            errorMessage = errorText.length > 200 ? `${errorText.substring(0, 200)}...` : errorText;
          }
        } catch {
          // Use default error message
        }
      }
      console.error("n8n webhook error:", errorMessage);
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }

    // Parse and return the JSON response
    let data;
    try {
      const contentType = response.headers.get("content-type");
      const contentLength = response.headers.get("content-length");
      console.log("Response headers:", {
        "content-type": contentType,
        "content-length": contentLength,
        "status": response.status,
        "statusText": response.statusText
      });
      
      // Get the raw response text first
      const rawText = await response.text();
      console.log("Raw response length:", rawText.length);
      console.log("Raw response (first 1000 chars):", rawText.substring(0, 1000));
      console.log("Raw response (last 500 chars):", rawText.substring(Math.max(0, rawText.length - 500)));
      
      // Check if response is empty
      if (!rawText || rawText.trim().length === 0) {
        console.error("Empty response received from n8n webhook");
        console.error("Response status:", response.status);
        console.error("Response headers:", Object.fromEntries(response.headers.entries()));
        return NextResponse.json(
          { 
            error: "Empty response received from workflow. This usually means:\n1. The 'Respond to Webhook' node isn't receiving data from 'Clean Text'\n2. The expression {{ $json.cleaned_html }} is returning empty\n3. Check n8n Executions tab to see if the workflow completed successfully\n\nCheck the n8n execution logs to see what data is available at the 'Respond to Webhook' node." 
          },
          { status: 500 }
        );
      }
      
      // Check content type
      if (contentType && !contentType.includes("application/json")) {
        console.error("Non-JSON response received. Content-Type:", contentType);
        return NextResponse.json(
          { 
            error: `Invalid response format. Expected JSON but got ${contentType}. Response preview: ${rawText.substring(0, 200)}` 
          },
          { status: 500 }
        );
      }
      
      // Try to parse as JSON
      try {
        data = JSON.parse(rawText);
        console.log("Successfully parsed JSON. Keys:", Object.keys(data));
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
        console.error("Response that failed to parse:", rawText);
        return NextResponse.json(
          { 
            error: `Invalid JSON response from workflow. The response appears to be: ${rawText.substring(0, 300)}. Make sure your 'Respond to Webhook' node is set to return JSON format.` 
          },
          { status: 500 }
        );
      }
    } catch (error) {
      console.error("Failed to read response:", error);
      return NextResponse.json(
        { 
          error: `Failed to read response from workflow: ${error instanceof Error ? error.message : "Unknown error"}` 
        },
        { status: 500 }
      );
    }

    if (!data.html) {
      return NextResponse.json(
        { error: "Invalid response from workflow: missing html field" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error processing workflow request:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error occurred" },
      { status: 500 }
    );
  }
}

