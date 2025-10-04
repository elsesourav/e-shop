import './global.css';
import Providers from './providers';

export const metadata = {
  title: 'Eshop - Seller',
  description: 'Eshop Seller Panel',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
