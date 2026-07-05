// POST-based SSE consumer: fetches a streaming route and invokes onEvent
// for every `data: {...}` line.
export async function streamRequest(
  url: string,
  body: unknown,
  onEvent: (event: Record<string, unknown> & { type: string }) => void,
): Promise<void> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok || !res.body) {
    let message = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      if (data?.error) message = data.error;
    } catch {
      // non-JSON error body
    }
    throw new Error(message);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split("\n\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data: ")) continue;
      try {
        onEvent(JSON.parse(trimmed.slice(6)));
      } catch {
        // ignore malformed chunks
      }
    }
  }
}
