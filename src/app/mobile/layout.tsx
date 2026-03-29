import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Field Monitor",
  description: "OOH Campaign Field Monitoring",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Field Monitor",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#e63946",
};

export default function MobileLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Desktop: show redirect message */}
      <div className="hidden md:flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-center p-10 max-w-sm">
          <div className="w-16 h-16 bg-[#e63946] rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <span className="text-white text-2xl font-bold">FM</span>
          </div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">Field Monitor</h1>
          <p className="text-gray-500 text-sm mb-6">
            This interface is designed for mobile devices. Use your phone or tablet to access the field app.
          </p>
          <a
            href="/dashboard"
            className="inline-block bg-[#e63946] text-white px-6 py-3 rounded-lg font-semibold text-sm"
          >
            Go to Dashboard
          </a>
        </div>
      </div>

      {/* Mobile: show app */}
      <div className="md:hidden min-h-screen bg-gray-50">{children}</div>
    </>
  );
}
