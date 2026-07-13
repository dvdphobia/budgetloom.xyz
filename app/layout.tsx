import "./globals.css";

export const metadata = {
  title: "BudgetLoom - Budget Printables & Money-Saving Guides",
  description:
    "Free budget printables, money-saving challenges, and simple guides to help you save more and spend smarter.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="p:domain_verify" content="REPLACE_WITH_PINTEREST_TAG" />
      </head>
      <body>{children}</body>
    </html>
  );
}
