import { Oregano, Poppins, Roboto } from 'next/font/google';
import Header from '../shared/widgets/header';
import './global.css';
import Providers from './providers';

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

const oregano = Oregano({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-Oregano',
});

export const metadata = {
  title: 'Eshop',
  description: 'Eshop Application',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body
        className={`${poppins.variable} ${roboto.variable} ${oregano.variable}`}
      >
        <Providers>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  );
}
