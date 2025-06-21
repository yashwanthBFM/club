export async function GET() {
  return new Response(JSON.stringify({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'user-web'
  }), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
} 