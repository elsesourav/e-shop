import './global.css';
import Providers from './providers';
import { Poppins, Roboto } from 'next/font/google';

export const metadata = {
  title: 'Eshop - Seller',
  description: 'Eshop Seller Panel',
};

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-Poppins',
});

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['100', '300', '400', '500', '700', '900'],
  variable: '--font-Roboto',
});


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`min-h-screen bg-[rgb(40,42,56)] font-sans antialiased ${poppins.variable} ${roboto.variable}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
