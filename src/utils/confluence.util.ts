import { config } from 'dotenv';

config();

export function generateAuthorization() {
  const email = process.env.CONFLUENCE_EMAIL;
  const apiKey = process.env.CONFLUENCE_API_KEY;

  return `Basic ${Buffer.from(`${email}:${apiKey}`).toString('base64')}`;
}

/**
 * @param cursor 커서 URL (예: /wiki/api/v2/pages?limit=1&cursor=eyJpZCI6...)
 * @returns 추출된 토큰 문자열
 */
export function parseOpaqueCursorToken(cursor: string): string | null {
  if (!cursor) {
    return null;
  }

  const match = cursor.match(/cursor=([^&]+)/);

  return match ? match[1] : null;
}
