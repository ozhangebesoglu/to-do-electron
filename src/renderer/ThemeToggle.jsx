import { useState, useEffect, useRef } from 'react';

// Tema tanımları
const THEMES = [
  { id: 'dark', name: 'Karanlık', icon: '🌙' },
  { id: 'light', name: 'Aydınlık', icon: '☀️' },
  { id: 'ocean', name: 'Ocean Blue', icon: '🌊' },
  { id: 'sakura', name: 'Sakura', icon: '🌸' },
  { id: 'forest', name: 'Forest Green', icon: '🌲' },
  { id: 'sunset', name: 'Sunset', icon: '🔥' },
  { id: 'purple', name: 'Purple Haze', icon: '💜' },
  { id: 'mocha', name: 'Mocha', icon: '☕' },
  { id: 'galaxy', name: 'Galaxy', icon: '🌌' },
  { id: 'nord', name: 'Nord', icon: '🏔️' }
];

function ThemeToggle() {
  const [theme, setTheme] = useState('dark');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Tema değişikliklerini localStorage'den yükle
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  // Dropdown dışına tıklanınca kapat
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Temayı değiştir
  const changeTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    setIsOpen(false);
  };

  const currentTheme = THEMES.find(t => t.id === theme) || THEMES[0];

  return (
    <div className="theme-selector" ref={dropdownRef}>
      <button 
        className="theme-toggle" 
        onClick={(e) => {
          e.stopPropagation();
          console.log('Theme toggle clicked, isOpen:', isOpen);
          setIsOpen(!isOpen);
        }}
        title="Tema seç"
      >
        {currentTheme.icon}
        {currentTheme.name}
        <span className={`dropdown-arrow ${isOpen ? 'open' : ''}`}>▼</span>
      </button>
      
      {isOpen && (
        <div className="theme-dropdown">
          {THEMES.map(theme_item => (
            <button
              key={theme_item.id}
              className={`theme-option ${theme === theme_item.id ? 'active' : ''}`}
              onClick={() => changeTheme(theme_item.id)}
            >
              <span className="theme-icon">{theme_item.icon}</span>
              <span className="theme-name">{theme_item.name}</span>
              {theme === theme_item.id && <span className="check">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default ThemeToggle;