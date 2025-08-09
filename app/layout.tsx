export const metadata = {
  title: 'College Football Fantasy',
  description: 'Power 4 fantasy football — main landing',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: '#0a0a0a', color: '#ededed', fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Inter, Arial' }}>
        {children}
      </body>
    </html>
  );
}

