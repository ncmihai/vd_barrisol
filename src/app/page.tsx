import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function RootPage() {
  const headerList = await headers()
  const acceptLanguage = headerList.get('accept-language') || ''

  if (/\ben\b/i.test(acceptLanguage) && !/\bro\b/i.test(acceptLanguage)) {
    redirect('/en')
  }

  redirect('/ro')
}
