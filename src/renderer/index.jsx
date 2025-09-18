import React from 'react';
import { createRoot } from 'react-dom/client';
import { TodoApp } from './todo-app.jsx';
import './styles.css';

// 21st.dev Toolbar yalnızca development ortamında yüklenir.
let ToolbarWrapper = ({ children }) => children;
if (process.env.NODE_ENV !== 'production') {
	try {
		const { TwentyFirstToolbar } = require('@21st-extension/toolbar-react');
		const { ReactPlugin } = require('@21st-extension/react');
		ToolbarWrapper = ({ children }) => (
			<TwentyFirstToolbar config={{ plugins: [ReactPlugin()] }}>
				{children}
			</TwentyFirstToolbar>
		);
	} catch (e) {
		console.warn('21st Toolbar yüklenemedi:', e);
	}
}

createRoot(document.getElementById('root')).render(
	<ToolbarWrapper>
		<TodoApp />
	</ToolbarWrapper>
);
