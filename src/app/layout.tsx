import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "../index.css";

// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = {
  title: "Transcriptr | AI Audio Transcription",
  description:
    "Convert audio to text with AI-powered transcription. Supports multiple formats and languages, providing fast and accurate results.",
  keywords:
    "audio transcription, ai transcription, speech to text, convert audio to text, replicate, whisper",
  authors: [{ name: "Transcriptr" }],
  robots: "index, follow",
  openGraph: {
    type: "website",
    url: "https://transcriptr.aramb.dev/",
    siteName: "Transcriptr",
    title: "Transcriptr | AI Audio Transcription",
    description:
      "Convert audio to text with AI-powered transcription. Supports multiple formats and languages, providing fast and accurate results.",
    images: [
      {
        url: "https://transcriptr.aramb.dev/social_preview.png",
        alt: "Transcriptr, convert audio to text with a fast AI powered engine",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "https://transcriptr.aramb.dev/",
    title: "Transcriptr | AI Audio Transcription",
    description:
      "Convert audio to text with AI-powered transcription. Supports multiple formats and languages, providing fast and accurate results.",
    images: ["https://transcriptr.aramb.dev/social_preview.png"],
  },
};

// eslint-disable-next-line react-refresh/only-export-components
export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans">
        <div id="root">{children}</div>
        {/* Hidden form for Netlify */}
        <form
          name="feedback"
          data-netlify="true"
          data-netlify-honeypot="bot-field"
          hidden
        >
          <input type="text" name="name" />
          <input type="email" name="email" />
          <input type="text" name="feedbackType" />
          <input type="text" name="browser" />
          <input type="text" name="operatingSystem" />
          <textarea name="feedback"></textarea>
        </form>
        <Script
          async
          src="https://fundingchoicesmessages.google.com/i/pub-YOUR_PUBLISHER_ID?ers=1"
          nonce="YOUR_NONCE"
          strategy="afterInteractive"
        />
        <Script id="google-fc-present" strategy="afterInteractive">
          {`
            (function () {
              function signalGooglefcPresent() {
                if (!window.frames['googlefcPresent']) {
                  if (document.body) {
                    const iframe = document.createElement('iframe');
                    iframe.style = 'width: 0; height: 0; border: none; z-index: -1000; left: -1000px; top: -1000px;';
                    iframe.style.display = 'none';
                    iframe.name = 'googlefcPresent';
                    document.body.appendChild(iframe);
                  } else {
                    setTimeout(signalGooglefcPresent, 0);
                  }
                }
              }
              signalGooglefcPresent();
            })();
          `}
        </Script>
        <Script id="google-tag-manager" strategy="lazyOnload">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-PZJLV82QQ6');
          `}
        </Script>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-PZJLV82QQ6"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
