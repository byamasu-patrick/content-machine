import { NextResponse, NextRequest } from 'next/server'
import { signOut } from '@/auth'

export async function GET(req: NextRequest) {
  try {
    if (req.method !== 'GET') {
      return NextResponse.json(
        { message: 'Method not allowed' },
        { status: 405 }
      )
    }

    await signOut()
    return NextResponse.redirect('/login')
  } catch (error) {
    return NextResponse.json({ message: 'Error signing out' }, { status: 500 })
  }
}
