import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "@fontsource-variable/archivo";
import "@fontsource-variable/space-grotesk";
import "./globals.css";

const introBootstrap = `
  (() => {
    const root = document.documentElement;
    let shouldPlay = true;

    try {
      shouldPlay = sessionStorage.getItem("offset-intro-played-v2") !== "true";
    } catch {}

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      shouldPlay = false;
    }

    root.dataset.offsetIntro = shouldPlay ? "play" : "skip";
  })();
`;

export const metadata: Metadata = {
  title: {
    default: "OFFSET® — Independent Digital Studio",
    template: "%s — OFFSET®",
  },
  description:
    "Independent digital studio in Ireland building distinctive websites and digital experiences.",
  openGraph: {
    title: "OFFSET® — We Don't Do Ordinary.",
    description:
      "Independent digital studio building distinctive websites and digital experiences.",
    type: "website",
    locale: "en_IE",
  },
};

export const viewport: Viewport = {
  themeColor: "#101110",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <noscript>
          <style>{`html, body { overflow: auto !important; } .studio-intro { display: none !important; }`}</style>
        </noscript>
      </head>
      <body>
        <Script id="offset-intro-bootstrap" strategy="beforeInteractive">
          {introBootstrap}
        </Script>
        {children}
      </body>
    </html>
  );
}
