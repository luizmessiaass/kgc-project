import type { Metadata } from 'next'
import './globals.css'
import Cart from './components/Cart'

export const metadata: Metadata = {
  title: 'KGC',
  description: 'KGC - Streetwear',
  icons: { icon: '/assets/logo.gif' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
      </head>
      <body>
        {children}
        <Cart />
      </body>
    </html>
  )
}
