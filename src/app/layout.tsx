import "~/styles/globals.css";
import { type Metadata } from "next";
import { Providers } from "~/providers/providers";

export const metadata: Metadata = {
    title: "VBTix - Concert Ticketing Platform",
    description: "Buy and sell concert tickets with ease",
    icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en" suppressHydrationWarning>
        <body>
        <Providers>{children}</Providers>
        </body>
        </html>
    );
}
