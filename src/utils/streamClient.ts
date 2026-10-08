export interface StreamChatOptions {
  url?: string;
  payload: Record<string, unknown>;
  userAbortSignal?: AbortSignal;
  onChunk: (chunkText: string) => void;
  onGrounding?: (grounding: { sources?: { title: string; url: string }[]; searchQueries?: string[] }) => void;
  onDone?: (accumulatedText: string) => void;
  onError?: (error: Error) => void;
}

export interface StreamChatResult {
  completed: boolean;
  text: string;
  error?: string;
}

/**
 * Online-Only Real-Time Streaming Client
 * Communicates directly with the neural backend via Server-Sent Events (SSE).
 */
export async function streamOnlineChat(
  options: StreamChatOptions
): Promise<StreamChatResult> {
  const {
    url = '/api/chat',
    payload,
    userAbortSignal,
    onChunk,
    onGrounding,
    onDone,
    onError,
  } = options;

  let accumulatedText = '';

  if (userAbortSignal?.aborted) {
    return { completed: false, text: '' };
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
      },
      body: JSON.stringify(payload),
      signal: userAbortSignal,
    });

    if (!response.ok || !response.body) {
      const errBody = await response.text().catch(() => '');
      throw new Error(errBody || `HTTP ${response.status}: Failed to reach the online model service.`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    const processLine = (line: string) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith(':')) return; // ignore comments/keepalive
      if (!trimmed.startsWith('data:')) return;

      const dataStr = trimmed.slice(5).trim();
      if (dataStr === '[DONE]') return;

      try {
        const parsed = JSON.parse(dataStr);
        if (parsed.text) {
          accumulatedText += parsed.text;
          onChunk(parsed.text);
        }
        if (parsed.grounding && onGrounding) {
          onGrounding(parsed.grounding);
        }
        if (parsed.error) {
          console.warn('[streamOnlineChat]: Server error message:', parsed.error);
        }
      } catch {
        // Skip parse error on partial chunks
      }
    };

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        processLine(line);
      }
    }

    if (buffer.trim()) {
      const remainingLines = buffer.split('\n');
      for (const line of remainingLines) {
        processLine(line);
      }
    }

    onDone?.(accumulatedText);
    return {
      completed: true,
      text: accumulatedText,
    };
  } catch (err: unknown) {
    const errorObj = err instanceof Error ? err : new Error(String(err));

    if (errorObj.name === 'AbortError') {
      onDone?.(accumulatedText);
      return {
        completed: false,
        text: accumulatedText,
      };
    }

    onError?.(errorObj);
    return {
      completed: false,
      text: accumulatedText,
      error: errorObj.message || 'Unable to connect to the online AI service.',
    };
  }
}
