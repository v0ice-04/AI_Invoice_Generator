import React from 'react';
import { Download, FileText, Eye } from 'lucide-react';
import { getDownloadUrl } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';

const InvoiceHistory = ({ invoices, onView }) => {
    const { t } = useLanguage();

    if (!invoices || invoices.length === 0) {
        return (
            <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <p className="text-slate-500 dark:text-slate-400">{t('noInvoices')}</p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden border border-slate-200 dark:border-slate-700">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    {t('historyTitle')}
                </h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-300 text-xs uppercase tracking-wider font-semibold">
                        <tr>
                            <th className="px-6 py-3">#</th>
                            <th className="px-6 py-3">{t('date')}</th>
                            <th className="px-6 py-3">{t('client')}</th>
                            <th className="px-6 py-3 text-right">{t('amount')}</th>
                            <th className="px-6 py-3 text-center">{t('view')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-slate-700 dark:text-slate-300 text-sm">
                        {invoices.map((invoice) => (
                            <tr key={invoice._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                <td className="px-6 py-4 font-medium">{invoice.invoiceNumber}</td>
                                <td className="px-6 py-4">
                                    {new Date(invoice.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4">{invoice.clientName}</td>
                                <td className="px-6 py-4 text-right font-bold">
                                    {invoice.totalAmount.toFixed(2)}
                                </td>
                                <td className="px-6 py-4 flex justify-center gap-2">
                                    <button
                                        onClick={() => onView(invoice)}
                                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
                                        title={t('view')}
                                    >
                                        <Eye className="w-4 h-4" />
                                    </button>
                                    <a
                                        href={getDownloadUrl(invoice._id)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-full transition-colors"
                                        title={t('download')}
                                    >
                                        <Download className="w-4 h-4" />
                                    </a>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default InvoiceHistory;
