import "../../globals.css";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Dynamic route segment is [theme], removed this to avoid type errors in next 15
  return (
    <html lang="en">
      {/*
        <head /> will contain the components returned by the nearest parent
        head.tsx. Find out more at https://beta.nextjs.org/docs/api-reference/file-conventions/head
      */}
      <head />
      <body>{children}</body>
    </html>
  );
}
