import React, { useState } from 'react';
import { Send, Loader2, MapPin, CreditCard } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const PromptInput = ({ onGenerate, loading }) => {
    const [prompt, setPrompt] = useState('');
    const [clientAddress, setClientAddress] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('Net Banking');
    const { t } = useLanguage();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (prompt.trim()) {
            // Pass object instead of just prompt string
            onGenerate({ prompt, clientAddress, paymentMethod });
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto mb-8 animate-fade-in-up space-y-4">
            <form onSubmit={handleSubmit} className="relative bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">

                {/* Main Prompt Input */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        What do you want toinvoice?
                    </label>
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder={t('promptPlaceholder')}
                        className="w-full p-4 text-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none transition-all min-h-[100px]"
                        rows={3}
                    />
                </div>

                {/* Extra Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {/* Payment Method */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            <CreditCard className="w-4 h-4" />
                            Payment Method
                        </label>
                        <select
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option value="Net Banking">Net Banking</option>
                            <option value="UPI">UPI</option>
                            <option value="Cash">Cash</option>
                            <option value="Cheque">Cheque</option>
                            <option value="Credit Card">Credit Card</option>
                        </select>
                    </div>

                    {/* Client Address */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            <MapPin className="w-4 h-4" />
                            Client Address (Optional)
                        </label>
                        <input
                            type="text"
                            value={clientAddress}
                            onChange={(e) => setClientAddress(e.target.value)}
                            placeholder="e.g. 123 Main St, New York"
                            className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                </div>

                <div className="flex justify-end pt-2">
                    <button
                        type="submit"
                        disabled={loading || !prompt.trim()}
                        className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                        {t('generateButton')}
                    </button>
                </div>

                <p className="mt-4 text-xs text-slate-400 dark:text-slate-500 text-center border-t border-slate-100 dark:border-slate-700/50 pt-4">
                    {t('poweredBy')}
                </p>
            </form>
        </div>
    );
};

export default PromptInput;
