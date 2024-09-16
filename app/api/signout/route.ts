import { NextResponse } from 'next/server'
import { signOut } from '@/auth'

export async function POST() {
  try {
    await signOut()
    return NextResponse.redirect('/signin')
  } catch (error) {
    return NextResponse.json({ message: 'Error signing out' }, { status: 500 })
  }
}
