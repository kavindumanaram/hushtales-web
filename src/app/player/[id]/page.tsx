export default function PlayerPage({ params }: { params: { id: string } }) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <p className="text-white/50 text-lg font-medium">Player ({params.id}) — coming soon</p>
    </div>
  );
}
