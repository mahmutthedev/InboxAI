export interface GmailMessagePreview {
  id: string
  subject: string
  from: string
  snippet: string
  date: string
}

interface GmailListResponse {
  messages?: Array<{ id: string }>
  nextPageToken?: string
  resultSizeEstimate?: number
  error?: unknown
}

interface GmailMessageResponse {
  id: string
  snippet: string
  payload?: {
    headers?: Array<{ name?: string; value?: string }>
  }
}

const GMAIL_API_BASE = "https://gmail.googleapis.com/gmail/v1/users/me"

function extractHeader(headers: Array<{ name?: string; value?: string }>, key: string) {
  return (
    headers.find((header) => header.name?.toLowerCase() === key.toLowerCase())?.value ??
    ""
  )
}

export async function listUserMessages(accessToken: string, maxResults = 10): Promise<GmailMessagePreview[]> {
  const headers = {
    Authorization: `Bearer ${accessToken}`,
  }

  const listResponse = await fetch(
    `${GMAIL_API_BASE}/messages?maxResults=${maxResults}&q=`,
    {
      headers,
      next: { revalidate: 0 },
    }
  )

  if (!listResponse.ok) {
    throw new Error("Failed to load Gmail messages")
  }

  const listJson = (await listResponse.json()) as GmailListResponse

  if (!listJson.messages?.length) {
    return []
  }

  const previews = await Promise.all(
    listJson.messages.map(async ({ id }) => {
      const detailResponse = await fetch(
        `${GMAIL_API_BASE}/messages/${id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`,
        {
          headers,
          next: { revalidate: 0 },
        }
      )

      if (!detailResponse.ok) {
        throw new Error("Failed to load Gmail message details")
      }

      const detailJson = (await detailResponse.json()) as GmailMessageResponse
      const detailHeaders = detailJson.payload?.headers ?? []

      return {
        id: detailJson.id,
        subject: extractHeader(detailHeaders, "Subject") || "(No subject)",
        from: extractHeader(detailHeaders, "From") || "Unknown sender",
        snippet: detailJson.snippet,
        date: extractHeader(detailHeaders, "Date"),
      }
    })
  )

  return previews
}
