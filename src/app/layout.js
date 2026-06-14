import "./globals.css";

export const metadata = {
  title: "Oak & Bean POS Terminal",
  description: "Web-based Restaurant/Cafe POS Terminal frontend application.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
