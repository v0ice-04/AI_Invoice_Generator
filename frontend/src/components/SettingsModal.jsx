import React, { useState, useEffect } from 'react';
import { Settings, Save, Upload, X } from 'lucide-react';
import { getSettings, updateSettings, uploadLogo } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';

const SettingsModal = ({ open, onClose }) => {
    const { t } = useLanguage();
    const [settings, setSettingsData] = useState({
        companyName: '',
        companyAddress: '',
        companyTaxId: '',
        prefix: 'INV-',
        nextInvoiceNumber: 1,
        logoPath: ''
    });
    const [logoFile, setLogoFile] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) {
            fetchSettings();
        }
    }, [open]);

    const fetchSettings = async () => {
        try {
            const data = await getSettings();
            setSettingsData(data);
        } catch (error) {
            console.error('Failed to load settings');
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            await updateSettings(settings);
            if (logoFile) {
                await uploadLogo(logoFile);
            }
            onClose();
        } catch (error) {
            console.error('Failed to save settings');
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setLogoFile(e.target.files[0]);
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg p-6 animate-fade-in-up">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800 dark:text-white">
                        <Settings className="w-5 h-5" />
                        Invoice Settings
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                <div className="space-y-4">
                    {/* Logo Upload */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Company Logo</label>
                        <div className="flex items-center gap-4">
                            {(settings.logoPath || logoFile) && (
                                <img
                                    src={logoFile ? URL.createObjectURL(logoFile) : `http://localhost:5000/uploads/${settings.logoPath.split('/').pop()}`} // Simple serve
                                    alt="Logo Preview"
                                    className="h-12 w-auto object-contain border rounded p-1 dark:bg-slate-200"
                                />
                            )}
                            <label className="flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                                <Upload className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                                <span className="text-sm text-slate-600 dark:text-slate-400">Upload New Logo</span>
                                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                            </label>
                        </div>
                    </div>

                    {/* Company Details */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Company Name</label>
                        <input
                            type="text"
                            value={settings.companyName}
                            onChange={(e) => setSettingsData({ ...settings, companyName: e.target.value })}
                            className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Company Address</label>
                        <textarea
                            value={settings.companyAddress}
                            onChange={(e) => setSettingsData({ ...settings, companyAddress: e.target.value })}
                            rows={3}
                            className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tax ID / GSTIN</label>
                            <input
                                type="text"
                                value={settings.companyTaxId}
                                onChange={(e) => setSettingsData({ ...settings, companyTaxId: e.target.value })}
                                className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Invoice Prefix</label>
                            <input
                                type="text"
                                value={settings.prefix}
                                onChange={(e) => setSettingsData({ ...settings, prefix: e.target.value })}
                                className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">Cancel</button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors disabled:opacity-50"
                    >
                        <Save className="w-4 h-4" />
                        {loading ? 'Saving...' : 'Save Settings'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
