/** Re-mounts on navigation, giving each dashboard page a subtle entrance. */
export default function DashboardTemplate({ children }: { children: React.ReactNode }) {
  return <div className="animate-rise">{children}</div>;
}
