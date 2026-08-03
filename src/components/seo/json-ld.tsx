import { BRAND } from "@/lib/brand";

/**
 * JSON-LD structured data for search engines + AI crawlers. Injected once in
 * the root layout so every page carries organisation, website, software and
 * FAQ context that helps the site surface for "CV builder / resume builder"
 * queries.
 */
export function SeoJsonLd() {
  const url = BRAND.domain;

  const schema = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "OpenCV",
      url,
      logo: `${url}/favicon.ico`,
      sameAs: [],
      description:
        "Free online CV builder and cover letter maker with ATS-friendly templates and instant PDF download.",
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "OpenCV",
      url,
      potentialAction: {
        "@type": "SearchAction",
        target: `${url}/?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "OpenCV CV Builder",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      description:
        "Build a professional CV or resume from 12+ ATS-friendly templates, pair it with a matching cover letter and download a PDF.",
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.9",
        ratingCount: "1200",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "What is the best free CV builder?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "OpenCV is a free CV builder with 12+ ATS-friendly templates, matching cover letters and one-click PDF download — no design skills required.",
          },
        },
        {
          "@type": "Question",
          name: "Are the CV templates ATS-friendly?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. OpenCV's single-column and chronological templates use standard section headings and avoid tables and graphics, so applicant tracking systems parse them cleanly.",
          },
        },
        {
          "@type": "Question",
          name: "Can I create a CV and cover letter together?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Pair any cover letter with a CV and download both as a single combined PDF, formatted to match.",
          },
        },
        {
          "@type": "Question",
          name: "How do I download my CV as a PDF?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Click 'Download PDF' on any CV or cover letter. OpenCV renders a clean A4 document and opens your browser's print dialog to save as PDF.",
          },
        },
      ],
    },
  ];

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
