export async function requireSession(request: Request): Promise<{ id: string }>{
  // TODO: integrate with your Appwrite/Next session
  // Throw 401 Response on failure
  const cookie = request.headers.get('cookie') || '';
  if (!cookie.includes('a_session_') && !cookie.includes('appwrite-session')) {
    throw new Response('Unauthorized', { status: 401 });
  }
  return { id: 'session' };
}

export function requireInternal(request: Request) {
  const key = request.headers.get('x-internal-key');
  if (!key || key !== process.env.INTERNAL_API_KEY) {
    throw new Response('Unauthorized', { status: 401 });
  }
}
