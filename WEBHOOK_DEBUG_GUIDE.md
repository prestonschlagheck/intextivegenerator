# n8n Webhook Integration - Debugging Guide

## Current Issue

The Next.js frontend is receiving an **empty response** from the n8n webhook. The workflow processes the PDF successfully, but the "Respond to Webhook" node is returning an empty body.

## What the Frontend Expects

The Next.js API route (`/api/run-workflow`) expects the n8n webhook to return:

1. **HTTP Status**: `200 OK`
2. **Content-Type Header**: `application/json`
3. **Response Body** (JSON format):
   ```json
   {
     "html": "<!DOCTYPE html>...full HTML string here..."
   }
   ```

## Current n8n Configuration

- **Webhook Node**: Receives POST request with `multipart/form-data`
  - Field `file`: PDF file
  - Field `instructions`: Text string (optional)

- **Workflow Path**: Webhook → Extract → Parse → AI Processing → Clean Text → Respond to Webhook

- **Respond to Webhook Node** (current config):
  - Response Code: `200`
  - Response Headers: `Content-Type: application/json`
  - Respond With: `JSON`
  - Response Body JSON: `{ "html": "{{ $json.cleaned_html }}" }`

## The Problem

The "Respond to Webhook" node is returning an **empty response body**, which means:

1. Either the node isn't receiving data from "Clean Text"
2. Or the expression `{{ $json.cleaned_html }}` is evaluating to empty/null
3. Or the node isn't properly connected in the workflow

## What to Check in n8n

### Step 1: Verify "Clean Text" Node Output
1. Open the "Clean Text" node in your workflow
2. Click on it and look at the **INPUT** panel on the left
3. Check what fields are available in the JSON output
4. **Find the exact field name** that contains the HTML string
   - Is it `cleaned_html`?
   - Or `html`, `text`, `output`, `content`, or something else?
5. Note the exact field name (case-sensitive!)

### Step 2: Check "Respond to Webhook" Node Input
1. Open the "Respond to Webhook" node
2. Look at the **INPUT** panel
3. Does it show data from "Clean Text"?
4. If it shows "No data", the connection is broken

### Step 3: Verify Connection
1. In the workflow canvas, ensure there's a connection line from "Clean Text" to "Respond to Webhook"
2. The connection should be visible as a line between the nodes

### Step 4: Test the Expression
1. In "Respond to Webhook" node, check the expression `{{ $json.cleaned_html }}`
2. If the field name is different, update it to match what you found in Step 1
3. For example:
   - If field is `html`: Use `{{ $json.html }}`
   - If field is `text`: Use `{{ $json.text }}`
   - If nested: Use `{{ $json.data.html }}`

### Step 5: Check Execution Logs
1. Go to **Executions** tab in n8n
2. Find the most recent execution (from when you tested)
3. Click on it to see the execution details
4. Open the "Respond to Webhook" node in that execution
5. Check:
   - What data it received (INPUT)
   - What it sent (OUTPUT)
   - Any error messages

## Error Messages Explained

The Next.js API route provides detailed error messages to help debug:

### 1. "Empty response received from workflow"
**Meaning**: The webhook returned an HTTP 200 response, but the response body is completely empty (0 bytes).

**Possible Causes**:
- "Respond to Webhook" node isn't receiving data
- Expression `{{ $json.cleaned_html }}` is empty/null
- Node isn't connected properly

**What to Do**:
- Check n8n Executions tab to see if workflow completed
- Verify "Respond to Webhook" node received data from "Clean Text"
- Check if the field name in the expression matches the actual field name

### 2. "Invalid response format. Expected JSON but got [content-type]"
**Meaning**: The webhook returned a response, but it's not JSON (might be HTML, text, or binary).

**Possible Causes**:
- "Respond to Webhook" node is set to "Raw" or "Text" instead of "JSON"
- Content-Type header is missing or wrong

**What to Do**:
- Set "Respond With" to `JSON` in the "Respond to Webhook" node
- Add header: `Content-Type: application/json`

### 3. "Invalid JSON response from workflow. The response appears to be: [preview]"
**Meaning**: The response body exists but isn't valid JSON (might be malformed, truncated, or wrong format).

**Possible Causes**:
- JSON syntax error in the response
- Expression returned invalid JSON
- Response was cut off

**What to Do**:
- Check the preview in the error message to see what was actually returned
- Verify the JSON expression is correct: `{ "html": "{{ $json.cleaned_html }}" }`
- Make sure there are no extra characters or formatting issues

### 4. "Invalid response: missing html field"
**Meaning**: The response is valid JSON, but it doesn't have an `html` field.

**Possible Causes**:
- JSON structure is wrong (maybe `{ "data": { "html": "..." } }` instead of `{ "html": "..." }`)
- Field name is different

**What to Do**:
- Check the error message - it will show the keys in the JSON object
- Update the "Respond to Webhook" node to match the actual structure
- Or update the frontend code to read from the correct path

### 5. "Failed to connect to webhook: [error]"
**Meaning**: The Next.js server couldn't reach the n8n webhook URL at all.

**Possible Causes**:
- Webhook URL is wrong
- n8n instance is down
- Network/firewall issue
- Environment variable not set

**What to Do**:
- Verify `N8N_WEBHOOK_URL` environment variable is set correctly
- Test the webhook URL directly (browser or Postman)
- Check if n8n workflow is active

## Quick Fixes to Try

### Fix 1: Use "First Incoming Item" Instead of Expression
If the expression isn't working:
1. Set "Respond With" to `First Incoming Item`
2. Then use "Respond with Expression" to format it:
   ```json
   {
     "html": "{{ $json.cleaned_html }}"
   }
   ```

### Fix 2: Try Multiple Field Names
If you're not sure of the field name:
```json
{
  "html": "{{ $json.cleaned_html || $json.html || $json.text || $json.output }}"
}
```

### Fix 3: Check Node Output Directly
1. Add a temporary "Set" node between "Clean Text" and "Respond to Webhook"
2. Use it to see what fields are actually available
3. Then update the expression accordingly

## What to Tell Claude

"Hi Claude, I'm getting an empty response from my n8n webhook. The workflow processes the PDF successfully through all nodes (Extract → Parse → AI → Clean Text), but when it reaches the 'Respond to Webhook' node, it returns an empty response body.

Current configuration:
- Respond With: JSON
- Response Code: 200
- Response Headers: Content-Type: application/json
- Response Body JSON: { "html": "{{ $json.cleaned_html }}" }

The Next.js frontend expects: { "html": "<html string>" }

Can you help me:
1. Verify what field name the 'Clean Text' node actually outputs (is it cleaned_html, html, text, or something else?)
2. Check if the 'Respond to Webhook' node is receiving data from 'Clean Text'
3. Verify the connection between 'Clean Text' and 'Respond to Webhook' is correct
4. Test the expression {{ $json.cleaned_html }} to see if it's evaluating correctly

The error message says 'Empty response received from workflow', which means the HTTP response has no body content."

