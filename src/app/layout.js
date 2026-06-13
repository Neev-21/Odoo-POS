import "./globals.css";

export const metadata = {
  title: "Retro Diner POS Terminal",
  description: "Premium glassmorphic Single Page Restaurant/Cafe POS Terminal frontend application.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
