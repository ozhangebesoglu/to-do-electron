import React from 'react';
import { createRoot } from 'react-dom/client';
import { TodoApp } from './todo-app.jsx';
import './styles.css';

createRoot(document.getElementById('root')).render(<TodoApp />);
