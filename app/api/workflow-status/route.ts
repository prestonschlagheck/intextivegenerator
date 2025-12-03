import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const jobId = request.nextUrl.searchParams.get("jobId");

  if (!jobId) {
    return NextResponse.json(
      { error: "Missing jobId" },
      { status: 400 }
    );
  }

  const apiUrl = process.env.N8N_API_URL;
  const apiKey = process.env.N8N_API_KEY;
  const tableId = process.env.N8N_DATA_TABLE_ID;

  if (!apiUrl || !apiKey || !tableId) {
    return NextResponse.json(
      {
        error: "n8n API is not configured",
        missing: {
          apiUrl: !apiUrl,
          apiKey: !apiKey,
          tableId: !tableId,
        },
      },
      { status: 500 }
    );
  }

  const url = new URL(
    `${apiUrl}/projects/kVGq2z4fdCz0U52Q/data-tables/${tableId}/rows`
  );
  url.searchParams.set("limit", "1");
  url.searchParams.set(
    "filter",
    JSON.stringify({
      jobId: {
        value: jobId,
        operation: "=",
      },
    })
  );

  const response = await fetch(url, {
    headers: {
      "X-N8N-API-KEY": apiKey,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return NextResponse.json(
      {
        error: "Failed to query workflow status",
        status: response.status,
      },
      { status: response.status }
    );
  }

  const json = await response.json();
  const row = json?.data?.[0];

  if (!row) {
    return NextResponse.json({ status: "not_found" });
  }

  return NextResponse.json({
    status: row.status,
    htmlBase64: row.htmlBase64,
    error: row.error,
    updatedAt: row.updatedAt,
  });
}

