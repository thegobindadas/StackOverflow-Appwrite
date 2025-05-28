import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import getOrCreateDB from './models/server/dbSetup';
import getOrCreateStroage from './models/server/storage.collection';



export async function middleware(request: NextRequest) {

  await Promise.all([
    getOrCreateDB(),
    getOrCreateStroage()
  ])


  return NextResponse.next()
}


export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)"
  ],
}