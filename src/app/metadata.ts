// Next.js 15+ Metadata API for SEO
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Task Planner",
  description: "An AI-powered productivity app for managing tasks, generating images, and using voice input. Built with Next.js 15 and React 19.",
  keywords: [
    "AI Task Planner",
    "Task Management",
    "Productivity",
    "Next.js 15",
    "React 19",
    "Voice Input",
    "Image Generation",
    "Fal API",
    "ElevenLabs"
  ],
  openGraph: {
    title: "AI Task Planner",
    description: "An AI-powered productivity app for managing tasks, generating images, and using voice input.",
    siteName: "AI Task Planner",
    type: "website",
    url: "https://your-domain.com/",
    images: [
      {
        url: "https://your-domain.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "AI Task Planner Open Graph Image"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Task Planner",
    description: "An AI-powered productivity app for managing tasks, generating images, and using voice input.",
    images: ["https://your-domain.com/og-image.png"]
  },
  metadataBase: new URL("https://your-domain.com/")
};
