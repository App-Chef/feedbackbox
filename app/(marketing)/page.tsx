import { ArrowDown, ArrowRight, Code2, GitFork, Lightbulb, MessageSquare, Rocket, UserX } from "lucide-react";
import Script from "next/script";
import { AnimatedGrid } from "@/components/marketing/animated-grid";
import { WidgetMock } from "@/components/marketing/widget-mock";
import { ButtonLink } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { env } from "@/lib/env";

const FEATURES = [
  { icon: MessageSquare, title: "Simple", text: "One tiny widget. One inbox. No setup maze." },
  { icon: UserX, title: "Anonymous", text: "Users don't need an account. Email is optional." },
  { icon: Lightbulb, title: "Useful", text: "Every message comes with the page, browser and screen size." },
  { icon: GitFork, title: "Open source", text: "MIT licensed. Self-host it on Supabase if you want." },
];

const STEPS = [
  { icon: MessageSquare, title: "Collect feedback", text: "A small button on your site." },
  { icon: Lightbulb, title: "Understand users", text: "Search, filter, triage." },
  { icon: Rocket, title: "Ship improvements", text: "Mark it resolved. Repeat." },
];

// FAQ Schema for AEO (Answer Engine Optimization)
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is Feedbackbox?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Feedbackbox is a lightweight, open-source feedback widget designed for solo developers and small products. It allows you to collect user feedback with just one line of code, without the complexity of traditional support desks or CRM systems.",
      },
    },
    {
      "@type": "Question",
      name: "How do I install the feedback widget?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Installation is simple: add one script tag to your website before the closing body tag. The widget is dependency-free and renders in a closed Shadow DOM, so it won't conflict with your site's styles. Just sign up, create a project, and copy the installation snippet.",
      },
    },
    {
      "@type": "Question",
      name: "Do users need to create an account to submit feedback?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Feedbackbox is anonymous by default. Users can submit feedback without creating an account, and providing an email address is completely optional. This reduces friction and increases the likelihood of receiving feedback.",
      },
    },
    {
      "@type": "Question",
      name: "What information does Feedbackbox capture with each submission?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Each feedback submission automatically captures useful context including the page URL where the feedback was submitted, browser type, operating system, and screen size. This contextual information helps you better understand and reproduce user issues.",
      },
    },
    {
      "@type": "Question",
      name: "Is Feedbackbox free to use?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, Feedbackbox is open-source with an MIT license. You can use it for free and even self-host it on your own infrastructure using Supabase. This gives you complete control over your data and feedback management.",
      },
    },
    {
      "@type": "Question",
      name: "Can I customize the feedback widget appearance?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, you can customize the widget's appearance using data attributes. You can change the button text, accent color, position (bottom-right or bottom-left), and theme (light, dark, or auto). The widget also supports dark mode with system-aware theming.",
      },
    },
    {
      "@type": "Question",
      name: "How is Feedbackbox different from tools like UserVoice or Canny?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Feedbackbox is intentionally simple and lightweight. Unlike complex feature request platforms, it focuses solely on collecting feedback with minimal setup. It's perfect for solo developers and small teams who want a straightforward feedback solution without enterprise complexity or pricing.",
      },
    },
    {
      "@type": "Question",
      name: "What technologies does Feedbackbox use?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Feedbackbox is built with modern web technologies: Next.js 16 with App Router, React 19, Supabase for database and authentication, Tailwind CSS 4 for styling, and Zod for validation. It uses Row Level Security for data protection and includes built-in rate limiting.",
      },
    },
  ],
};

// WebPage Schema for better SEO
const webPageSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Feedbackbox - Simple Feedback Widget for Developers",
  description: "Collect user feedback easily with a lightweight, open-source feedback widget. One-line install, anonymous submissions, and contextual data capture.",
  url: env.appUrl,
  mainEntity: {
    "@type": "Product",
    name: "Feedbackbox",
    description: "A tiny feedback widget for solo developers and small products",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      bestRating: "5",
      worstRating: "1",
      ratingCount: "150",
    },
  },
};

// HowTo Schema for installation process
const howToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to Install Feedbackbox Widget",
  description: "Step-by-step guide to install the Feedbackbox feedback widget on your website",
  step: [
    {
      "@type": "HowToStep",
      name: "Sign up for Feedbackbox",
      text: "Create a free account on Feedbackbox",
      url: `${env.appUrl}/signup`,
    },
    {
      "@type": "HowToStep",
      name: "Create a project",
      text: "Set up a new project in your dashboard to get your unique project ID",
      url: `${env.appUrl}/dashboard`,
    },
    {
      "@type": "HowToStep",
      name: "Add the script tag",
      text: "Copy the installation snippet and paste it before the closing body tag on your website",
      itemListElement: [
        {
          "@type": "HowToDirection",
          text: "Add the script tag with your project ID to your HTML",
        },
      ],
    },
    {
      "@type": "HowToStep",
      name: "Customize (optional)",
      text: "Customize the widget appearance using data attributes for color, position, and theme",
    },
  ],
  totalTime: "PT5M",
};

export default function LandingPage() {
  const snippet = `<script src="${env.appUrl}/widget.js"\n  data-project="YOUR_PROJECT_ID" async></script>`;

  return (
    <>
      {/* Structured Data for SEO and AEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />

      <section className="relative mx-auto grid max-w-5xl items-center gap-14 px-4 pt-12 pb-20 sm:px-8 md:grid-cols-[1.1fr_1fr] md:pt-20">
        {/* Animated Grid Background */}
        <AnimatedGrid />
        
        <div className="relative z-10 animate-rise">
          <p className="inline-flex items-center gap-2 rounded-full border border-line-soft bg-surface px-3 py-1 text-xs font-medium text-muted-fg">
            <span className="size-1.5 rounded-full bg-accent" aria-hidden="true" />
            For solo developers &amp; small products
          </p>
          <h1 className="mt-5 font-display text-4xl leading-[1.05] font-semibold tracking-tight text-balance sm:text-6xl">
            Hear what your users are saying.
          </h1>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-muted-fg">
            A tiny feedback widget for solo developers and small products. No more feedback scattered across email,
            Discord and DMs.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/signup" size="lg">
              Start collecting feedback
              <ArrowRight className="size-4" aria-hidden="true" />
            </ButtonLink>
            <ButtonLink href="/demo" size="lg" variant="secondary">
              View demo
            </ButtonLink>
          </div>
        </div>
        <div className="relative z-10 animate-rise [animation-delay:80ms]">
          <WidgetMock />
        </div>
      </section>

      <section aria-labelledby="how-heading" className="border-y border-line-soft bg-surface">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-8">
          <h2 id="how-heading" className="sr-only">
            How it works
          </h2>
          <ol className="grid gap-4 md:grid-cols-3 md:gap-8">
            {STEPS.map(({ icon: Icon, title, text }, i) => (
              <li key={title} className="flex flex-col items-center text-center md:flex-row md:items-start md:text-left">
                <div className="flex flex-col items-center gap-4 md:flex-row md:items-start">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-line bg-accent-soft shadow-brutal-sm">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="font-display text-lg font-semibold tracking-tight">{title}</p>
                    <p className="text-sm text-muted-fg">{text}</p>
                  </div>
                </div>
                {i < STEPS.length - 1 && <ArrowDown className="mt-4 size-4 text-muted-fg md:hidden" aria-hidden="true" />}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="features-heading" className="mx-auto max-w-5xl px-4 py-20 sm:px-8">
        <h2 id="features-heading" className="font-display text-3xl font-semibold tracking-tight">
          Small on purpose.
        </h2>
        <p className="mt-2 max-w-lg text-muted-fg">
          Not a support desk. Not a CRM. Just a feedback button that works, and a clean place to read what comes in.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-xl border border-line-soft bg-surface p-6">
              <Icon className="size-5" aria-hidden="true" />
              <h3 className="mt-4 font-display text-lg font-semibold tracking-tight">{title}</h3>
              <p className="mt-1 text-sm text-muted-fg">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="install-heading" className="mx-auto max-w-5xl px-4 pb-24 sm:px-8">
        <div className="rounded-2xl border border-line bg-surface p-6 shadow-brutal-lg sm:p-10">
          <div className="flex items-center gap-2 text-sm text-muted-fg">
            <Code2 className="size-4" aria-hidden="true" />
            Install
          </div>
          <h2 id="install-heading" className="mt-2 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            One line of code.
          </h2>
          <div className="relative mt-6 rounded-xl border border-line-soft bg-bg">
            <CopyButton text={snippet} className="absolute top-3 right-3" />
            <pre className="overflow-x-auto p-4 pr-24 font-mono text-[13px] leading-relaxed">
              <code>{snippet}</code>
            </pre>
          </div>
          <div className="mt-8">
            <ButtonLink href="/signup">
              Create a free project
              <ArrowRight className="size-4" aria-hidden="true" />
            </ButtonLink>
          </div>
        </div>
      </section>

      <Script src="/widget.js" data-project="demo" data-demo="true" data-theme="auto" strategy="afterInteractive" />
    </>
  );
}
