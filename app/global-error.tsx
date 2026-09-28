"use client";

export default function GlobalError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", display: "grid", placeItems: "center", minHeight: "100vh", margin: 0 }}>
        <div style={{ textAlign: "center" }}>
          <h1 style={{ fontSize: 20 }}>Something went wrong.</h1>
          <p style={{ color: "#5f5f59" }}>Please try again.</p>
          <button type="button" onClick={() => retry()} style={{ marginTop: 16, padding: "8px 16px", borderRadius: 10, border: "1px solid #121211", background: "#ff5a1f", cursor: "pointer" }}>
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
