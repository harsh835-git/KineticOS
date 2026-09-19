export const PublicFooter = () => (
  <footer className="border-t border-white/[0.08] bg-[#09090b] py-8 text-zinc-500 text-xs">
    <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <span className="font-bold text-zinc-300">KineticOS</span>
        <span className="text-zinc-600">•</span>
        <span>Adaptive Load & Performance Architecture</span>
      </div>
      <div className="flex flex-wrap items-center justify-center sm:justify-end gap-4 text-zinc-400">
        <span>© {new Date().getFullYear()} KineticOS. All rights reserved.</span>
        <span className="text-zinc-600">•</span>
        <span>Developed by <strong className="text-zinc-200">Harsh Soni</strong></span>
      </div>
    </div>
  </footer>
);