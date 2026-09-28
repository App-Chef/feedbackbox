export type SnippetFramework = "html" | "nextjs" | "react" | "vue";

export const SNIPPET_LABELS: Record<SnippetFramework, string> = {
  html: "HTML",
  nextjs: "Next.js",
  react: "React",
  vue: "Vue",
};

export function widgetSnippets(appUrl: string, projectId: string): Record<SnippetFramework, { file: string; code: string }> {
  const src = `${appUrl.replace(/\/$/, "")}/widget.js`;

  return {
    html: {
      file: "index.html — before </body>",
      code: `<script
  src="${src}"
  data-project="${projectId}"
  async>
</script>`,
    },
    nextjs: {
      file: "app/layout.tsx",
      code: `import Script from "next/script";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Script
          src="${src}"
          data-project="${projectId}"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}`,
    },
    react: {
      file: "App.tsx",
      code: `import { useEffect } from "react";

export function App() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "${src}";
    script.dataset.project = "${projectId}";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return <YourApp />;
}`,
    },
    vue: {
      file: "App.vue",
      code: `<script setup>
import { onMounted } from "vue";

onMounted(() => {
  const script = document.createElement("script");
  script.src = "${src}";
  script.dataset.project = "${projectId}";
  script.async = true;
  document.body.appendChild(script);
});
</script>`,
    },
  };
}
