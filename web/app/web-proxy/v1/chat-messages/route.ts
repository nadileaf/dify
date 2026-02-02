import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

function getBackendUrl(): string {
  return process.env.NEXT_PUBLIC_PUBLIC_API_PREFIX || 'http://localhost:5001/api'
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid Authorization header' },
        { status: 401 },
      )
    }

    const body = await request.json()

    const { user, query, inputs, response_mode = 'streaming', conversation_id, files, web_app_code } = body

    if (!web_app_code) {
      return NextResponse.json(
        { error: 'Missing required field: web_app_code' },
        { status: 400 },
      )
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Missing required field: user' },
        { status: 400 },
      )
    }

    if (!query) {
      return NextResponse.json(
        { error: 'Missing required field: query' },
        { status: 400 },
      )
    }

    const backendUrl = getBackendUrl()
    const passportUrl = `${backendUrl}/passport?user_id=${encodeURIComponent(user)}`

    const passportResponse = await fetch(passportUrl, {
      method: 'GET',
      headers: {
        'X-App-Code': web_app_code,
      },
    })

    if (!passportResponse.ok) {
      const errorText = await passportResponse.text()
      return NextResponse.json(
        { error: 'Failed to authenticate user', details: errorText },
        { status: passportResponse.status },
      )
    }

    const { access_token: webToken } = await passportResponse.json()

    const chatUrl = `${backendUrl}/chat-messages`
    const chatResponse = await fetch(chatUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${webToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        inputs: inputs || {},
        response_mode,
        conversation_id,
        files,
      }),
    })

    if (!chatResponse.ok) {
      const errorText = await chatResponse.text()
      return NextResponse.json(
        { error: 'Failed to send message', details: errorText },
        { status: chatResponse.status },
      )
    }

    if (response_mode === 'streaming') {
      return new NextResponse(chatResponse.body, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      })
    }
    else {
      const responseData = await chatResponse.json()
      return NextResponse.json(responseData)
    }
  }
  catch (error) {
    console.error('Error in /web-proxy/v1/chat-messages:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    )
  }
}
