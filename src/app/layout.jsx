import './globals.css'

export const metadata = {
  title: 'SnapCal',
  description: 'AI Powered Calorie Tracker',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
