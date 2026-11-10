/**
 * The one Server-Sent Events reader (frontend.md §2): frames are separated by a blank line,
 * each `data:` line is JSON. A malformed frame is skipped; the handler's own errors propagate.
 * Cancel with the fetch's AbortSignal: the pending read then rejects with an AbortError.
 */
export async function readSse(res: Response, onData: (data: unknown) => void): Promise<void> {
  if (!res.body) return;
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  const handleFrame = (frame: string) => {
    for (const line of frame.split("\n")) {
      if (!line.startsWith("data: ")) continue;
      let data: unknown;
      try {
        data = JSON.parse(line.slice(6));
      } catch {
        continue; // a malformed frame is skipped, not fatal
      }
      onData(data);
    }
  };

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const frames = buffer.split("\n\n");
    buffer = frames.pop() ?? "";
    frames.forEach(handleFrame);
  }
  buffer += decoder.decode();
  if (buffer.trim()) handleFrame(buffer); // a last frame without the trailing blank line
}
