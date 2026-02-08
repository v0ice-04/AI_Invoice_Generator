import axios from 'axios';

const API_URL = 'http://localhost:5000/api/invoice';
const SETTINGS_URL = 'http://localhost:5000/api/settings';

export const generateInvoice = async (data) => {
    // data includes prompt, clientAddress, paymentMethod
    const response = await axios.post(`${API_URL}/generate`, data);
    return response.data;
};

export const getAllInvoices = async () => {
    const response = await axios.get(`${API_URL}/`);
    return response.data;
};

export const getDownloadUrl = (invoiceId) => {
    return `${API_URL}/${invoiceId}/download`;
};

// Settings API
export const getSettings = async () => {
    const response = await axios.get(SETTINGS_URL);
    return response.data;
};

export const updateSettings = async (settings) => {
    const response = await axios.put(SETTINGS_URL, settings);
    return response.data;
};

export const uploadLogo = async (file) => {
    const formData = new FormData();
    formData.append('logo', file);
    const response = await axios.post(`${SETTINGS_URL}/logo`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
};
