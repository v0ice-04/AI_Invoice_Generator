import React from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import Home from './pages/Home';

function App() {
    return (
        <ThemeProvider>
            <LanguageProvider>
                <Home />
            </LanguageProvider>
        </ThemeProvider>
    );
}

export default App;
