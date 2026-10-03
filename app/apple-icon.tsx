import { ImageResponse } from "next/og";

// apple-touch-icon (home screen on iOS); Next links it in <head> automatically.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#080909",
        }}
      >
        <svg width="120" height="120" viewBox="0 0 32 32">
          <rect x="2" y="2" width="28" height="28" rx="8" fill="none" stroke="#f0f1f2" strokeWidth="2.5" />
          <path d="M10 11l5 5-5 5M16 21h6" stroke="#c8f04d" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    ),
    size,
  );
}
