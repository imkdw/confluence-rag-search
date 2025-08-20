import { config } from 'dotenv';

config();

/**
 * 컨플루언스 인증 토큰 생성
 * @returns 컨플루언스 인증 토큰
 */
export function generateConfluenceAuthorization() {
  const email = process.env.CONFLUENCE_EMAIL;
  const apiKey = process.env.CONFLUENCE_API_KEY;

  const prefix = 'Basic';

  return `${prefix} ${Buffer.from(`${email}:${apiKey}`).toString('base64')}`;
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
