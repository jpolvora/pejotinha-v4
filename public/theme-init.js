(function() {
  try {
    var theme = localStorage.getItem('theme') || 'dark';
    var color = localStorage.getItem('themeColor') || 'theme-blue';
    var root = document.documentElement;
    root.classList.remove('light', 'dark', 'theme-blue', 'theme-orange', 'theme-purple', 'theme-green', 'theme-red', 'theme-zinc');
    
    if (theme === 'system') {
      theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    
    root.classList.add(theme);
    root.classList.add(color);
  } catch (e) {
    console.error('Theme initialization failed:', e);
  }
})();
