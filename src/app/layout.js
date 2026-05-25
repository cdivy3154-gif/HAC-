import "./globals.css";

export const metadata = {
  title: "HAC — AI Hackathon Finder 🐴",
  description:
    "Your witty AI-powered hackathon and competition finder. HAC scours the internet 24/7 to find the perfect hackathons for you. Basically Tinder but for hackathons.",
  keywords: [
    "hackathon",
    "competition",
    "AI",
    "finder",
    "student",
    "developer",
    "team",
    "coding",
  ],
  authors: [{ name: "HAC" }],
  creator: "HAC",
  metadataBase: new URL("https://hac-app.vercel.app"),
  openGraph: {
    title: "HAC — AI Hackathon Finder 🐴",
    description:
      "Your witty AI-powered hackathon and competition finder. Swipe right on code, not regrets.",
    url: "https://hac-app.vercel.app",
    siteName: "HAC",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HAC — AI Hackathon Finder 🐴",
    description:
      "Your witty AI-powered hackathon and competition finder. Swipe right on code, not regrets.",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "HAC",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0D1117" },
    { media: "(prefers-color-scheme: light)", color: "#F4F7FA" },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="dark" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        {/* PWA meta tags */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="apple-mobile-web-app-title" content="HAC" />

        {/* Favicon — use the logo */}
        <link rel="icon" href="/hac-logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/hac-logo.png" />
      </head>
      <body>
        {/* Theme initialization script — prevents flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('hac-theme');
                  if (theme === 'light' || theme === 'dark') {
                    document.documentElement.setAttribute('data-theme', theme);
                  } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
                    document.documentElement.setAttribute('data-theme', 'light');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />

        {children}

        {/* Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('[HAC] Service Worker registered:', registration.scope);
                    })
                    .catch(function(error) {
                      console.log('[HAC] Service Worker registration failed:', error);
                    });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
