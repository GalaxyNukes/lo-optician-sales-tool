import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { Plus_Jakarta_Sans } from 'next/font/google'
import { LanguageProvider } from '@/components/i18n'
import './globals.css'

const font = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-jakarta',
})

export const metadata: Metadata = {
  title: 'LensOnline — Campaign Catalog',
  description: 'Optician sales tool for LensOnline campaign selection and briefing',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="nl" className={font.variable}>
      <body>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  )
}
