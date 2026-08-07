import "@/app/globals.css";
import { type Children } from "@/common/types/reactTypes";
import { type Metadata, type Viewport } from "next";
import { Montserrat, Roboto } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import { GoogleAnalytics } from "@next/third-parties/google";
import { GOOGLE_ANALYTICS_ID } from "@/common/constants/environmentVariables";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  variable: "--font-roboto",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-montserrat",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export const metadata: Metadata = {
  title: "Floriwish - Send Gifts, Flowers, Cakes & Balloon Decoration",
  description: "Your One-Stop Shop for All Your Gifting & Celebration Needs",
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
};

export default function RootLayout({ children }: { children: Children }) {
  return (
    <html lang="en" className={`${roboto.variable} ${montserrat.variable}`}>
       <head>
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://d22rebqllszdz8.cloudfront.net" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://d3lno5tuwkddps.cloudfront.net" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://d22rebqllszdz8.cloudfront.net" />
        <link rel="dns-prefetch" href="https://d3lno5tuwkddps.cloudfront.net" />
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
        {children}
        <GoogleAnalytics gaId={GOOGLE_ANALYTICS_ID} />
      </body>
    </html>
  );
}
