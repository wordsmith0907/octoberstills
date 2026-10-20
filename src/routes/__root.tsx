import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { type ReactNode } from "react";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "OCTOBERSTILLS — Chaitya Shah | Photography, Films & Creative Direction" },
      {
        name: "description",
        content:
          "Photography, filmmaking, creative direction, and high-aesthetic UGC brand storytelling by Chaitya Shah.",
      },
      { property: "og:title", content: "OCTOBERSTILLS — Chaitya Shah" },
      {
        property: "og:description",
        content:
          "Editorial portfolio of photography, cinematic films, creative direction, and creator-led brand storytelling by Chaitya Shah.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://octoberstills.vercel.app/" },
      { property: "og:image", content: "https://octoberstills.vercel.app/selected-work/sw-3-poster.jpg" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:creator", content: "@octoberstills" },
      { name: "author", content: "Chaitya Shah" },
      { name: "theme-color", content: "#30231D" },
    ],
    links: [
      { rel: "canonical", href: "https://octoberstills.vercel.app/" },
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "alternate icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "apple-touch-icon", href: "/favicon.svg" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Host+Grotesk:ital,wght@0,300..800;1,300..800&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300;1,9..40,400&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

const SCHEMA_JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": "https://octoberstills.vercel.app/#person",
      "name": "Chaitya Shah",
      "jobTitle": "Creative Director, Cinematographer & Visual Storyteller",
      "worksFor": {
        "@type": "Organization",
        "name": "Octoberstills"
      },
      "url": "https://octoberstills.vercel.app/",
      "sameAs": [
        "https://www.instagram.com/octoberstills/",
        "https://www.threads.net/@octoberstills",
        "https://www.linkedin.com/in/chaityashah"
      ]
    },
    {
      "@type": "ProfessionalService",
      "@id": "https://octoberstills.vercel.app/#organization",
      "name": "Octoberstills",
      "founder": {
        "@id": "https://octoberstills.vercel.app/#person"
      },
      "url": "https://octoberstills.vercel.app/",
      "logo": "https://octoberstills.vercel.app/favicon.svg",
      "description": "An independent creative practice by Chaitya Shah, crafting stories through photography, films, and creative direction.",
      "email": "octoberstills@gmail.com",
      "knowsAbout": [
        "Editorial Photography",
        "Cinematography",
        "Creative Direction",
        "Creator UGC & Brand Storytelling",
        "Hospitality Visuals"
      ]
    }
  ]
};

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA_JSON_LD) }}
        />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
    </QueryClientProvider>
  );
}
