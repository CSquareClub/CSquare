import type { Metadata } from 'next'
import { IBM_Plex_Mono, Space_Grotesk } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import PageImpressionTracker from '@/components/analytics/page-impression-tracker'
import './globals.css'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  variable: '--font-ibm-plex-mono',
  weight: ['400', '500', '600'],
});

export const metadata: Metadata = {
  title: 'C Square Club',
  description:
    'C Square Club is a student-driven technical community where beginners become coders, coders become competitors, and competitors become builders.',
  icons: {
    icon: [
      {
        url: '/c-square.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/c-square-white.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${spaceGrotesk.variable} ${ibmPlexMono.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          storageKey="csquare-theme-v2"
          disableTransitionOnChange
        >
          <PageImpressionTracker />
          {children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
