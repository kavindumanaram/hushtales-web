// Lightweight, dependency-free route loader. Rendered instantly by Next's
// route-level loading.tsx boundaries the moment a nav link is clicked, so the
// app gives immediate feedback while the destination page's chunk/data loads.
// Kept as a pure server component with a CSS-only spinner so it compiles and
// paints instantly (no framer-motion / client JS to download first).
export default function RouteLoading() {
  return (
    <div
      className="flex items-center justify-center"
      style={{ minHeight: 'calc(100vh - 4rem)', background: '#080808' }}
    >
      <div className="flex flex-col items-center gap-4">
        <div
          className="w-10 h-10 rounded-full animate-spin"
          style={{
            border: '3px solid rgba(255,255,255,0.10)',
            borderTopColor: '#a78bfa',
          }}
        />
        <span className="text-white/35 text-xs font-semibold tracking-wide">
          Loading…
        </span>
      </div>
    </div>
  );
}
