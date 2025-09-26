export function Layout({ children }: { children: React.ReactNode }) {
  return <div className="h-full flex flex-col pt-[var(--header-offset,0px)]">{children}</div>
} 