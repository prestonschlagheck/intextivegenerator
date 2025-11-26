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
      data = await response.json();
    } catch (error) {
      console.error("Failed to parse JSON response:", error);
      return NextResponse.json(
        { error: "Invalid JSON response from workflow" },
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

