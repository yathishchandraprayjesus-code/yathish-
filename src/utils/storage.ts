export const SESSIONS_STORAGE_KEY = 'yathish_ai_chat_sessions_v2';
export const MEMORY_STORAGE_KEY = 'yathish_ai_memory_files_v2';
export const PROMPT_STORAGE_KEY = 'yathish_ai_system_prompt_v2';

export function saveLocalCache<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.warn(`Local cache save error for ${key}:`, err);
  }
}

export function loadLocalCache<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn(`Local cache load error for ${key}:`, err);
  }
  return fallback;
}
