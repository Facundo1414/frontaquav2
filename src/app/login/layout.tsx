// app/login/layout.tsx
import { Geist, Geist_Mono } from "next/font/google"

const geistSans = Geist({ subsets: ["latin"], variable: "--font-geist-sans" })
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" })

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  console.log('LOGIN LAYOUT')
  return <>{children}</>
}

