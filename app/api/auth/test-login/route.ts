import { Account, Client } from 'appwrite'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)

export async function POST(request: NextRequest) {
  let email: string | undefined
  let password: string | undefined
  try {
    const body = await request.json()
    email = String(body?.email || '')
    password = String(body?.password || '')
    // Create session via Appwrite REST to capture native cookie secret
    const resp = await fetch('https://nyc.cloud.appwrite.io/v1/account/sessions/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Appwrite-Project':
          process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'college-football-fantasy-app',
        'X-Appwrite-Response-Format': '1.4.0',
      },
      body: JSON.stringify({ email, password }),
    })
    if (!resp.ok) {
      throw Object.assign(new Error('login_failed'), { code: resp.status })
    }
    const setCookieHeader = resp.headers.get('set-cookie') || ''
    const match = setCookieHeader.match(/a_session_[^=]+=([^;]+)/)
    if (!match) throw new Error('missing_session_cookie')
    const secret = match[1]
    const cookieStore = await cookies()
    cookieStore.set('appwrite-session', secret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })
    return NextResponse.json({ success: true, user: { email } })
  } catch (error: any) {
    console.error('Login error:', error)

    // If user doesn't exist, create them
    if (
      (error?.code === 401 || error?.code === 400 || error?.message === 'login_failed') &&
      email &&
      password
    ) {
      try {
        const account = new Account(client)
        const user = await account.create('unique()', email, password, email.split('@')[0])
        // Re-run REST login to capture cookie
        const resp = await fetch('https://nyc.cloud.appwrite.io/v1/account/sessions/email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Appwrite-Project':
              process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'college-football-fantasy-app',
            'X-Appwrite-Response-Format': '1.4.0',
          },
          body: JSON.stringify({ email, password }),
        })
        if (!resp.ok) throw new Error('login_after_create_failed')
        const setCookieHeader = resp.headers.get('set-cookie') || ''
        const match = setCookieHeader.match(/a_session_[^=]+=([^;]+)/)
        if (!match) throw new Error('missing_session_cookie')
        const secret = match[1]
        const cookieStore = await cookies()
        cookieStore.set('appwrite-session', secret, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 60 * 24 * 7,
        })
        return NextResponse.json({
          success: true,
          user: { id: user.$id, email },
          message: 'Account created and logged in',
        })
      } catch (createError: any) {
        return NextResponse.json(
          {
            success: false,
            error: createError.message,
          },
          { status: 400 }
        )
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Login failed',
      },
      { status: 401 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST to login with email and password',
  })
}
