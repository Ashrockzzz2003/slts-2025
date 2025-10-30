import localFont from 'next/font/local';
import '@/app/globals.css';
import { Suspense } from 'react';

const gilroy = localFont({
  src: [
    {
      path: 'fonts/Gilroy-Black.ttf',
      weight: '900',
      style: 'normal',
    },
    {
      path: 'fonts/Gilroy-BlackItalic.ttf',
      weight: '900',
      style: 'italic',
    },
    {
      path: 'fonts/Gilroy-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
    {
      path: 'fonts/Gilroy-BoldItalic.ttf',
      weight: '700',
      style: 'italic',
    },
    {
      path: 'fonts/Gilroy-ExtraBold.ttf',
      weight: '800',
      style: 'normal',
    },
    {
      path: 'fonts/Gilroy-ExtraBoldItalic.ttf',
      weight: '800',
      style: 'italic',
    },
    {
      path: 'fonts/Gilroy-Heavy.ttf',
      weight: '900',
      style: 'normal',
    },
    {
      path: 'fonts/Gilroy-HeavyItalic.ttf',
      weight: '900',
      style: 'italic',
    },
    {
      path: 'fonts/Gilroy-Light.ttf',
      weight: '300',
      style: 'normal',
    },
    {
      path: 'fonts/Gilroy-LightItalic.ttf',
      weight: '300',
      style: 'italic',
    },
    {
      path: 'fonts/Gilroy-Medium.ttf',
      weight: '500',
      style: 'normal',
    },
    {
      path: 'fonts/Gilroy-MediumItalic.ttf',
      weight: '500',
      style: 'italic',
    },
    {
      path: 'fonts/Gilroy-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: 'fonts/Gilroy-RegularItalic.ttf',
      weight: '400',
      style: 'italic',
    },
    {
      path: 'fonts/Gilroy-SemiBold.ttf',
      weight: '600',
      style: 'normal',
    },
    {
      path: 'fonts/Gilroy-SemiBoldItalic.ttf',
      weight: '600',
      style: 'italic',
    },
    {
      path: 'fonts/Gilroy-Thin.ttf',
      weight: '100',
      style: 'normal',
    },
    {
      path: 'fonts/Gilroy-ThinItalic.ttf',
      weight: '100',
      style: 'italic',
    },
    {
      path: 'fonts/Gilroy-UltraLight.ttf',
      weight: '200',
      style: 'normal',
    },
    {
      path: 'fonts/Gilroy-UltraLightItalic.ttf',
      weight: '200',
      style: 'italic',
    },
  ],
  display: 'swap',
});

export const metadata = {
  title: 'SLBTS 2024',
  description: 'Sri Sathya Sai Balvikas Talent Search 2024, Tamil Nadu',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${gilroy.className} antialiased`}>
        <Suspense>{children}</Suspense>
      </body>
    </html>
  );
}
