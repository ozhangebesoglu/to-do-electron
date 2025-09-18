import React from 'react';
import { createRoot } from 'react-dom/client';
import { TodoApp } from './todo-app.jsx';
import './styles.css';

// 21st.dev Toolbar devre dışı (build sorunları nedeniyle)
let ToolbarWrapper = ({ children }) => children;

createRoot(document.getElementById('root')).render(
	<ToolbarWrapper>
		<TodoApp />
	</ToolbarWrapper>
);
