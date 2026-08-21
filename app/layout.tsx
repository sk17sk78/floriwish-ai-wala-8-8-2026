import "@/app/globals.css";
import { type Children } from "@/common/types/reactTypes";
import { type Metadata, type Viewport } from "next";
import { Roboto } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import Script from "next/script";
import dynamic from "next/dynamic";
import { GOOGLE_ANALYTICS_ID } from "@/common/constants/environmentVariables";

// Defer Firebase + Notification SDK out of critical JS bundle
const NotificationPrompt = dynamic(
  () => import("@/components/(frontend)/notifications/NotificationPrompt"),
  { ssr: false }
);

const Toaster = dynamic(
  () => import("@/components/ui/toaster").then((m) => m.Toaster),
  { ssr: false }
);

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  variable: "--font-roboto",
  preload: true,
  adjustFontFallback: true,
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://floriwish.com"),
  title: "Floriwish - Send Gifts, Flowers, Cakes & Balloon Decoration",
  description: "Your One-Stop Shop for All Your Gifting & Celebration Needs",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "Floriwish",
    statusBarStyle: "black-translucent",
    startupImage: [
      {
        url: "https://d22rebqllszdz8.cloudfront.net/c738cc2b-aab2-472f-925d-c673915cfacc/a35c7f6964a04132.webp"
      }
    ]
  },
  alternates: {
    canonical: "https://floriwish.com",
  },
  openGraph: {
    title: "Floriwish - Send Gifts, Flowers, Cakes & Balloon Decoration",
    description: "Your One-Stop Shop for All Your Gifting & Celebration Needs",
    url: "https://floriwish.com",
    siteName: "Floriwish",
    images: [
      {
        url: "https://d22rebqllszdz8.cloudfront.net/c738cc2b-aab2-472f-925d-c673915cfacc/a35c7f6964a04132.webp",
        width: 1200,
        height: 630,
        alt: "Floriwish - Gifts, Flowers & Decorations",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Floriwish - Send Gifts, Flowers, Cakes & Balloon Decoration",
    description: "Your One-Stop Shop for All Your Gifting & Celebration Needs",
    images: [
      "https://d22rebqllszdz8.cloudfront.net/c738cc2b-aab2-472f-925d-c673915cfacc/a35c7f6964a04132.webp",
    ],
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icons/icon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" }
    ],
    shortcut: ["/favicon.ico"],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      { url: "/icons/icon-152x152.png", sizes: "152x152", type: "image/png" },
      { url: "/icons/icon-120x120.png", sizes: "120x120", type: "image/png" }
    ]
  }
};

export default function RootLayout({ children }: { children: Children }) {
  return (
    <html lang="en" className={`${roboto.variable}`}>
       <head>
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://d22rebqllszdz8.cloudfront.net" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://d3lno5tuwkddps.cloudfront.net" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://d22rebqllszdz8.cloudfront.net" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icons/icon-32x32.png" type="image/png" sizes="32x32" />
        <link rel="icon" href="/icons/icon-192x192.png" type="image/png" sizes="192x192" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />

        {/* ── PWA & iOS Meta Tags ─────────────────────────────────── */}
        {/* Tells iOS Safari this is a PWA-capable site */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        {/* Status bar appearance when opened from Home Screen */}
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        {/* App name shown on iOS Home Screen */}
        <meta name="apple-mobile-web-app-title" content="Floriwish" />
        {/* Application name for Android PWA */}
        <meta name="application-name" content="Floriwish" />
        {/* Theme color for browser chrome (Android) */}
        <meta name="theme-color" content="#b76e79" />
        {/* MS Tile for Windows */}
        <meta name="msapplication-TileColor" content="#b76e79" />
        <meta name="msapplication-TileImage" content="/icons/icon-144x144.png" />
        <meta name="msapplication-tap-highlight" content="no" />
        {/* Manifest link */}
        <link rel="manifest" href="/manifest.json" />
        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="120x120" href="/icons/icon-120x120.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-180x180.png" />
        {/* iOS Splash Screens (iPhone/iPad) */}
        {/* iPhone 14 Pro Max */}
        <link rel="apple-touch-startup-image" media="screen and (device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
          href="https://d22rebqllszdz8.cloudfront.net/c738cc2b-aab2-472f-925d-c673915cfacc/a35c7f6964a04132.webp" />
        {/* iPhone 14 / 13 / 12 */}
        <link rel="apple-touch-startup-image" media="screen and (device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
          href="https://d22rebqllszdz8.cloudfront.net/c738cc2b-aab2-472f-925d-c673915cfacc/a35c7f6964a04132.webp" />
        {/* iPhone SE */}
        <link rel="apple-touch-startup-image" media="screen and (device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
          href="https://d22rebqllszdz8.cloudfront.net/c738cc2b-aab2-472f-925d-c673915cfacc/a35c7f6964a04132.webp" />
        {/* iPad Pro 12.9" */}
        <link rel="apple-touch-startup-image" media="screen and (device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
          href="https://d22rebqllszdz8.cloudfront.net/c738cc2b-aab2-472f-925d-c673915cfacc/a35c7f6964a04132.webp" />
        {/* iPad Air 10.9" */}
        <link rel="apple-touch-startup-image" media="screen and (device-width: 820px) and (device-height: 1180px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
          href="https://d22rebqllszdz8.cloudfront.net/c738cc2b-aab2-472f-925d-c673915cfacc/a35c7f6964a04132.webp" />
        {/* ────────────────────────────────────────────────────────── */}
      </head>
      <body className="relative font-sans antialiased">
        <NextTopLoader
          color="#b76e79"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px #b76e79,0 0 5px #b76e79"
        />
        <NotificationPrompt />
        {children}
        <Toaster />
        {/* GA deferred — page load block nahi karega */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ANALYTICS_ID}`}
          strategy="lazyOnload"
        />
        <Script id="google-analytics" strategy="lazyOnload">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GOOGLE_ANALYTICS_ID}', { send_page_view: false });
          `}
        </Script>
      </body>
    </html>
  );
}
