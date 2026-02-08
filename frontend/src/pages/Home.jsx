import React, { useState, useEffect } from 'react';
import PromptInput from '../components/PromptInput';
import InvoicePreview from '../components/InvoicePreview';
import InvoiceHistory from '../components/InvoiceHistory';
import SettingsModal from '../components/SettingsModal'; // Import
import { generateInvoice, getAllInvoices } from '../services/api';
import { Sparkles, AlertCircle, Moon, Sun, Languages, Settings } from 'lucide-react'; // Import Settings icon
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

const Home = () => {
    const [invoice, setInvoice] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('generate');
    const [isSettingsOpen, setIsSettingsOpen] = useState(false); // State for modal

    const { theme, toggleTheme } = useTheme();
    const { language, setLanguage, t } = useLanguage();

    const fetchHistory = async () => {
        try {
            const data = await getAllInvoices();
            setHistory(data);
        } catch (err) {
            console.error("Failed to fetch history");
        }
    };

    useEffect(() => {
        if (activeTab === 'history') {
            fetchHistory();
        }
    }, [activeTab]);

    const handleGenerate = async (data) => {
        setLoading(true);
        setError('');
        setInvoice(null);
        try {
            // data now contains { prompt, clientAddress, paymentMethod }
            const result = await generateInvoice(data);
            setInvoice(result);
        } catch (err) {
            console.error(err);
            setError(t('error'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white transition-colors duration-300">
            {/* Header */}
            <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                                <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <span className="font-bold text-xl hidden sm:block tracking-tight text-slate-800 dark:text-white">
                                {t('appTitle')}
                            </span>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Settings Button */}
                            <button
                                onClick={() => setIsSettingsOpen(true)}
                                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                                title="Settings"
                            >
                                <Settings className="w-5 h-5" />
                            </button>

                            {/* Language Selector */}
                            <div className="relative group hidden sm:block">
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors cursor-pointer border border-transparent hover:border-slate-300 dark:hover:border-slate-500">
                                    <Languages className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                                    <select
                                        value={language}
                                        onChange={(e) => setLanguage(e.target.value)}
                                        className="bg-transparent text-sm font-medium focus:outline-none appearance-none cursor-pointer pr-4 text-slate-700 dark:text-slate-200"
                                    >
                                        <option value="en" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-200">English</option>
                                        <option value="hi" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-200">Hindi</option>
                                        <option value="gu" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-200">Gujarati</option>
                                    </select>
                                </div>
                            </div>

                            {/* Theme Toggle */}
                            <button
                                onClick={toggleTheme}
                                className="p-2 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-yellow-400 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                            >
                                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Tabs */}
                {/* ... (Tabs code remains the same as previously, just need to make sure the surrounding structure is intact) ... */}
                <div className="flex justify-center mb-10">
                    <div className="inline-flex rounded-xl bg-white dark:bg-slate-800 p-1 shadow-sm border border-slate-200 dark:border-slate-700">
                        <button
                            onClick={() => setActiveTab('generate')}
                            className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'generate'
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                                }`}
                        >
                            {t('generateButton')}
                        </button>
                        <button
                            onClick={() => setActiveTab('history')}
                            className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'history'
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                                }`}
                        >
                            {t('historyTitle')}
                        </button>
                    </div>
                </div>

                {activeTab === 'generate' ? (
                    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up">
                        {/* Header Text removed for cleaner look, or can keep it */}
                        <div className="text-center space-y-4 mb-4">
                            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                                {t('appTitle')}
                            </h1>
                        </div>

                        <PromptInput onGenerate={handleGenerate} loading={loading} />

                        {error && (
                            <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg max-w-2xl mx-auto animate-pulse border border-red-100 dark:border-red-900/50">
                                <AlertCircle className="w-5 h-5" />
                                <p>{error}</p>
                            </div>
                        )}

                        <InvoicePreview invoice={invoice} />
                    </div>
                ) : (
                    <div className="max-w-5xl mx-auto animate-fade-in-up">
                        <InvoiceHistory
                            invoices={history}
                            onView={(inv) => {
                                setInvoice(inv);
                                setActiveTab('generate');
                            }}
                        />
                    </div>
                )}
            </main>

            {/* Settings Modal */}
            <SettingsModal open={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
        </div>
    );
};

export default Home;
