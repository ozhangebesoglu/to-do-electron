import { useState, useEffect } from 'react';

function ThemeToggle() {
  const [theme, setTheme] = useState('dark');

  // Tema değişikliklerini localStorage'den yükle
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  // Temayı değiştir
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return (
    <button 
      className="theme-toggle" 
      onClick={toggleTheme}
      title={`${theme === 'dark' ? 'Aydınlık' : 'Karanlık'} temaya geç`}
    >
      {theme === 'dark' ? '☀️' : '🌙'}
      {theme === 'dark' ? 'Aydınlık' : 'Karanlık'}
    </button>
  );
}

export default ThemeToggle;