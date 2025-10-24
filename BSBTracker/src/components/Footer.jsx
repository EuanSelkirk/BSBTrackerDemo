export default function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-slate-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-8 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
        <p>© {new Date().getFullYear()} Blue Swan Tracker · Static portfolio edition.</p>
        <div className="flex gap-4">
          <a href="mailto:hello@blueswanbouldering.com" className="hover:text-blue-600">
            Email
          </a>
          <a href="https://github.com/" target="_blank" rel="noreferrer" className="hover:text-blue-600">
            GitHub
          </a>
          <a href="https://www.instagram.com/" target="_blank" rel="noreferrer" className="hover:text-blue-600">
            Instagram
          </a>
        </div>
      </div>
    </footer>
  );
}
