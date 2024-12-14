import type { Metadata } from 'next';

import { siteConfig } from '@/config/site';
import React from 'react';
import Header from '@/components/Top/Header';
import Footer from '@/components/Top/Footer';
import AuthHeader from '@/components/auth/AuthHeader';

export const metadata: Metadata = {
  title: siteConfig.auth.title,
  description: siteConfig.auth.description,
  metadataBase: new URL(siteConfig.auth.url),
  openGraph: {
    title: siteConfig.auth.title,
    description: siteConfig.auth.description,
    url: siteConfig.auth.url,
    images: [
      {
        url: `${siteConfig.url}/default-og-image.jpg`,
        width: 800,
        height: 600,
        alt: siteConfig.auth.title,
      },
    ],
    siteName: siteConfig.auth.title,
  },
};

export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <AuthHeader />
      <main className="h-auto p-0">{children}</main>
    </>
  );
}
