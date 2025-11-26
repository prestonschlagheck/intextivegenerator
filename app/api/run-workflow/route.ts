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
        { 
          error: "N8N_WEBHOOK_URL is not configured",
          errorCode: "WEBHOOK_URL_MISSING",
          details: "The N8N_WEBHOOK_URL environment variable is not set. Add it to your .env.local file or Vercel environment variables."
        },
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
        { 
          error: "No file provided",
          errorCode: "FILE_MISSING",
          details: "The 'file' field is required in the form data."
        },
        { status: 400 }
      );
    }

    // Validate file type
    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { 
          error: "Only PDF files are allowed",
          errorCode: "INVALID_FILE_TYPE",
          details: `Received file type: ${file.type || "unknown"}. Expected: application/pdf`
        },
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
          error: `Failed to connect to webhook: ${fetchError instanceof Error ? fetchError.message : "Network error"}`,
          errorCode: "WEBHOOK_CONNECTION_FAILED",
          details: `Cannot reach n8n webhook at ${webhookUrl}. Check: 1) Webhook URL is correct, 2) n8n workflow is active, 3) Network/firewall allows connection.`,
          webhookUrl: webhookUrl
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
        { 
          error: errorMessage,
          errorCode: "N8N_WORKFLOW_ERROR",
          details: `n8n workflow returned status ${response.status}. Check n8n Executions tab for workflow errors.`,
          statusCode: response.status
        },
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
            error: "Empty response received from workflow",
            errorCode: "EMPTY_RESPONSE",
            details: "The n8n webhook returned HTTP 200 but the response body is empty (0 bytes).",
            troubleshooting: [
              "1. Check n8n Executions tab - did the workflow complete successfully?",
              "2. Open 'Respond to Webhook' node in the execution - does it show data in INPUT?",
              "3. Verify the expression {{ $json.cleaned_html }} matches the actual field name from 'Clean Text' node",
              "4. Ensure 'Clean Text' node is connected to 'Respond to Webhook' node",
              "5. Check if 'Respond to Webhook' node is set to 'Text' mode with Content-Type: application/json"
            ]
          },
          { status: 500 }
        );
      }
      
      // Check content type
      if (contentType && !contentType.includes("application/json")) {
        console.error("Non-JSON response received. Content-Type:", contentType);
        return NextResponse.json(
          { 
            error: `Invalid response format. Expected JSON but got ${contentType}`,
            errorCode: "INVALID_CONTENT_TYPE",
            details: `n8n returned Content-Type: ${contentType}, but we need application/json`,
            responsePreview: rawText.substring(0, 200),
            troubleshooting: [
              "1. In 'Respond to Webhook' node, add header: Content-Type: application/json",
              "2. Set 'Respond With' to either 'JSON' or 'Text' (with JSON string in body)",
              "3. Verify the response body is valid JSON format"
            ]
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
        console.error("Response that failed to parse (first 500 chars):", rawText.substring(0, 500));
        console.error("Response that failed to parse (last 200 chars):", rawText.substring(Math.max(0, rawText.length - 200)));
        
        // Check if it looks like JSON but has syntax errors
        if (rawText.trim().startsWith("{") || rawText.trim().startsWith("[")) {
          return NextResponse.json(
            { 
              error: "Invalid JSON syntax in workflow response",
              errorCode: "JSON_SYNTAX_ERROR",
              details: "The response looks like JSON but has syntax errors. This usually means unescaped quotes in the HTML content.",
              responsePreview: rawText.substring(0, 300),
              responseLength: rawText.length,
              troubleshooting: [
                "1. In n8n 'Respond to Webhook' node, use JSON.stringify() to properly escape the HTML:",
                "   Response Body: {\"html\":{{ JSON.stringify($json.cleaned_html) }}}",
                "2. Or ensure n8n automatically escapes quotes when using {{ $json.cleaned_html }}",
                "3. Check the response preview above to see where the JSON syntax breaks"
              ]
            },
            { status: 500 }
          );
        }
        
        return NextResponse.json(
          { 
            error: "Invalid JSON response from workflow",
            errorCode: "INVALID_JSON_FORMAT",
            details: "The response is not valid JSON format.",
            responsePreview: rawText.substring(0, 300),
            responseLength: rawText.length,
            troubleshooting: [
              "1. Set 'Respond to Webhook' node to 'JSON' mode, OR",
              "2. Use 'Text' mode with valid JSON string: {\"html\":\"{{ $json.cleaned_html }}\"}",
              "3. Ensure Content-Type header is set to application/json"
            ]
          },
          { status: 500 }
        );
      }
    } catch (error) {
      console.error("Failed to read response:", error);
      return NextResponse.json(
        { 
          error: `Failed to read response from workflow: ${error instanceof Error ? error.message : "Unknown error"}`,
          errorCode: "RESPONSE_READ_ERROR",
          details: "Could not read the response body from n8n webhook."
        },
        { status: 500 }
      );
    }

    if (!data.html) {
      const availableKeys = Object.keys(data);
      return NextResponse.json(
        { 
          error: "Invalid response from workflow: missing html field",
          errorCode: "MISSING_HTML_FIELD",
          details: `The response is valid JSON but doesn't contain an 'html' field.`,
          availableFields: availableKeys,
          troubleshooting: [
            `1. The JSON response has these fields: ${availableKeys.join(", ")}`,
            "2. Update 'Respond to Webhook' node to return: {\"html\": \"...\"}",
            `3. Or update frontend to read from: ${availableKeys[0] || "unknown field"}`
          ]
        },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error processing workflow request:", error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Unknown error occurred",
        errorCode: "UNEXPECTED_ERROR",
        details: "An unexpected error occurred while processing the workflow request."
      },
      { status: 500 }
    );
  }
}

