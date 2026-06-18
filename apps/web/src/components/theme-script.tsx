const SCRIPT = `(() => {
  try {
    var s = localStorage.getItem('nakhla.theme');
    var m = s || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    if (m === 'dark') document.documentElement.classList.add('dark');
  } catch (e) {}
})();`;

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: SCRIPT }} />;
}
