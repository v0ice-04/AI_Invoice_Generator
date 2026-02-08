import React from 'react';
import { Download, FileText } from 'lucide-react';
import { getDownloadUrl } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';

const InvoicePreview = ({ invoice }) => {
    const { t } = useLanguage();
    if (!invoice) return null;

    return (
        <div className="w-full max-w-3xl mx-auto bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden border border-slate-200 dark:border-slate-700 animate-fade-in-up transition-colors duration-300">
            {/* Header */}
            <div className="bg-slate-50 dark:bg-slate-900/50 px-8 py-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        {t('invoicePreview')}
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">#{invoice.invoiceNumber}</p>
                </div>
                <a
                    href={getDownloadUrl(invoice._id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm shadow-sm"
                >
                    <Download className="w-4 h-4" />
                    {t('downloadPDF')}
                </a>
            </div>

            {/* Body */}
            <div className="p-8">
                {/* Client & Date */}
                <div className="flex justify-between mb-8">
                    <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{t('billTo')}</p>
                        <p className="text-lg font-medium text-slate-900 dark:text-white">{invoice.clientName}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{t('dueDate')}</p>
                        <p className="text-slate-900 dark:text-white">
                            {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'}
                        </p>
                    </div>
                </div>

                {/* Table */}
                <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden mb-8">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-sm font-semibold">
                            <tr>
                                <th className="px-6 py-3">{t('description')}</th>
                                <th className="px-6 py-3 text-right">{t('amount')}</th>
                                <th className="px-6 py-3 text-right">{t('gst')} %</th>
                                <th className="px-6 py-3 text-right">{t('total')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-slate-700 dark:text-slate-300 text-sm">
                            <tr>
                                <td className="px-6 py-4">{invoice.serviceDescription}</td>
                                <td className="px-6 py-4 text-right">{invoice.baseAmount?.toFixed(2)}</td>
                                <td className="px-6 py-4 text-right">{invoice.gstPercentage}%</td>
                                <td className="px-6 py-4 text-right font-medium">{invoice.totalAmount?.toFixed(2)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Summary */}
                <div className="flex justify-end">
                    <div className="w-1/2 space-y-2">
                        <div className="flex justify-between text-slate-500 dark:text-slate-400 text-sm">
                            <span>{t('subtotal')}</span>
                            <span>{invoice.baseAmount?.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-slate-500 dark:text-slate-400 text-sm">
                            <span>{t('gst')} ({invoice.gstPercentage}%)</span>
                            <span>{invoice.gstAmount?.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-slate-900 dark:text-white font-bold text-lg pt-4 border-t border-slate-100 dark:border-slate-700">
                            <span>{t('grandTotal')}</span>
                            <span>{invoice.totalAmount?.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvoicePreview;
