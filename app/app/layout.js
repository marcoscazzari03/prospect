import './globals.css';

export const metadata = {
  title: 'Leads | Le Fonti Awards',
  robots: { index: false, follow: false }
};

export default function Layout({ children }) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  );
}
