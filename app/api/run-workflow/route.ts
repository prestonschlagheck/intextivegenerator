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
    const emails = formData.get("emails") as string | null;

    // Clean and validate email addresses
    let emailList: string[] = [];
    if (emails) {
      try {
        const parsedEmails = JSON.parse(emails);
        emailList = Array.isArray(parsedEmails) 
          ? parsedEmails.map(email => String(email).trim().replace(/^=+/, ''))
          : [];
      } catch {
        emailList = [];
      }
    }

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

    // Forward the request to n8n with cleaned emails
    const n8nFormData = new FormData();
    n8nFormData.append("file", file);
    n8nFormData.append("instructions", instructions || "");
    n8nFormData.append("emails", JSON.stringify(emailList));

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
      let errorCode = "N8N_WORKFLOW_ERROR";
      let details = `n8n workflow returned status ${response.status}. Check n8n Executions tab for workflow errors.`;
      
      // Special handling for 404 (test webhook already used or workflow inactive)
      if (response.status === 404) {
        errorMessage = "Workflow is not available";
        errorCode = "WEBHOOK_NOT_AVAILABLE";
        details = "The n8n workflow is either inactive or the test webhook has already been used. If using test mode, click 'Test workflow' in n8n again. For production, activate the workflow and use the production webhook URL.";
      }
      
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
          errorCode,
          details,
          statusCode: response.status
        },
        { status: response.status }
      );
    }

    // Parse and return the workflow response (JSON or HTML file)
    let data;
    try {
      const contentType = response.headers.get("content-type") || "";
      const contentLength = response.headers.get("content-length");
      const disposition = response.headers.get("content-disposition");
      const buffer = await response.arrayBuffer();
      const byteLength = buffer.byteLength;
      console.log("Response headers:", {
        "content-type": contentType,
        "content-length": contentLength,
        "content-disposition": disposition,
        bytes: byteLength,
        status: response.status,
        statusText: response.statusText
      });

      if (byteLength === 0) {
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

      const decoder = new TextDecoder("utf-8");
      const rawText = decoder.decode(buffer);

      if (contentType.includes("application/json")) {
        try {
          data = JSON.parse(rawText);
          console.log("Successfully parsed JSON. Keys:", Object.keys(data));
        } catch (parseError) {
          console.error("JSON parse error:", parseError);
          console.error("Response that failed to parse (first 500 chars):", rawText.substring(0, 500));
          console.error("Response that failed to parse (last 200 chars):", rawText.substring(Math.max(0, rawText.length - 200)));

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
      } else if (
        contentType.includes("text/html") ||
        contentType.includes("application/xhtml+xml") ||
        (!contentType && disposition?.includes(".html"))
      ) {
        // n8n responded with an HTML file. Send the contents back as { html: string }.
        data = { html: rawText };
        console.log("Received HTML file response. Length:", rawText.length);
      } else {
        console.error("Unexpected content type:", contentType);
        return NextResponse.json(
          { 
            error: `Invalid response format. Expected JSON or text/html but got ${contentType || "unknown"}`,
            errorCode: "INVALID_CONTENT_TYPE",
            details: "Update the n8n 'Respond to Webhook' node to return JSON (with {\"html\": \"...\"}) or a text/html file.",
            responsePreview: rawText.substring(0, 200)
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

    if (!data) {
      return NextResponse.json({ message: "Workflow accepted" });
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

