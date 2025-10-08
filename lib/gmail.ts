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
const GMAIL_LIST_BATCH_LIMIT = 500
const GMAIL_DETAIL_BATCH_SIZE = 25

function extractHeader(headers: Array<{ name?: string; value?: string }>, key: string) {
  return (
    headers.find((header) => header.name?.toLowerCase() === key.toLowerCase())?.value ??
    ""
  )
}

async function fetchMessageIds(accessToken: string, limit?: number) {
  const headers = { Authorization: `Bearer ${accessToken}` }
  const ids: string[] = []

  if (typeof limit === "number" && limit <= 0) {
    return { headers, ids }
  }

  let pageToken: string | undefined
  let remaining = typeof limit === "number" ? Math.max(limit, 0) : undefined

  while (true) {
    const batchSize =
      typeof remaining === "number"
        ? Math.min(GMAIL_LIST_BATCH_LIMIT, Math.max(remaining, 1))
        : GMAIL_LIST_BATCH_LIMIT

    const listUrl = new URL(`${GMAIL_API_BASE}/messages`)
    listUrl.searchParams.set("maxResults", String(batchSize))
    listUrl.searchParams.set("q", "")
    if (pageToken) {
      listUrl.searchParams.set("pageToken", pageToken)
    }

    const response = await fetch(listUrl, {
      headers,
      next: { revalidate: 0 },
    })

    if (!response.ok) {
      throw new Error("Failed to load Gmail messages")
    }

    const json = (await response.json()) as GmailListResponse
    const batchIds =
      json.messages?.map((message) => message.id).filter((id): id is string => Boolean(id)) ?? []

    ids.push(...batchIds)

    if (typeof remaining === "number") {
      remaining -= batchIds.length
      if (remaining <= 0) {
        break
      }
    }

    pageToken = json.nextPageToken

    if (!pageToken || batchIds.length === 0) {
      break
    }
  }

  return { headers, ids }
}

export async function listUserMessages(accessToken: string, limit?: number): Promise<GmailMessagePreview[]> {
  const { headers, ids } = await fetchMessageIds(accessToken, limit)

  if (!ids.length) {
    return []
  }

  const previews: GmailMessagePreview[] = []

  for (let index = 0; index < ids.length; index += GMAIL_DETAIL_BATCH_SIZE) {
    const chunk = ids.slice(index, index + GMAIL_DETAIL_BATCH_SIZE)

    const chunkData = await Promise.all(
      chunk.map(async (id) => {
        const detailUrl = new URL(`${GMAIL_API_BASE}/messages/${id}`)
        detailUrl.searchParams.set("format", "metadata")
        detailUrl.searchParams.append("metadataHeaders", "Subject")
        detailUrl.searchParams.append("metadataHeaders", "From")
        detailUrl.searchParams.append("metadataHeaders", "Date")

        const detailResponse = await fetch(detailUrl, {
          headers,
          next: { revalidate: 0 },
        })

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

    previews.push(...chunkData)
  }

  return previews
}
