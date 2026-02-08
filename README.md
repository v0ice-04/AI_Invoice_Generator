# AI Invoice Generator

A MERN stack application that generates professional invoices from natural language prompts using OpenAI.

## Features
- **Natural Language Parsing**: "Create invoice for web dev $500..." -> Structured Invoice.
- **Preview**: Real-time invoice preview.
- **PDF Download**: Download production-ready PDF invoices.
- **History**: Saves invoices to MongoDB.

## Prerequisites
- Node.js
- MongoDB (running locally or URI provided)
- OpenAI API Key

## Setup

### Backend
1. Navigate to `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file (or use the one provided) and add your OpenAI API Key:
   ```env
   OPENAI_API_KEY=sk-your-key...
   MONGO_URI=mongodb://localhost:27017/ai-invoice-app
   PORT=5000
   ```
4. Start the server:
   ```bash
   npm start
   ```

### Frontend
1. Navigate to `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```

## Usage
1. Open http://localhost:5173
2. Enter a prompt like:
   > "Generate an invoice for consulting services for Acme Corp, amount $1200, tax 10%."
3. Click generate.
4. Review and download PDF.
"# AI_Invoice_Generator" 
"# ai_invoice_genrator" 
