"use client";

import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { resetCodeDevice, generateCodeManually, generateAiCodeManually } from './actions';

export default function AdminClientTable({ codes, onRefresh }: { codes: any[], onRefresh?: () => void }) {
  const { t } = useLanguage();
  const [isGenerating, setIsGenerating] = useState(false);
  const [newCode, setNewCode] = useState<string | null>(null);

  const handleGenerateCode = async () => {
    setIsGenerating(true);
    setNewCode(null);
    try {
      const result = await generateCodeManually();
      if (result.success && result.code) {
        setNewCode(result.code);
        // Auto-hide success message after 5 seconds
        setTimeout(() => setNewCode(null), 5000);
        // Refresh the table
        if (onRefresh) onRefresh();
      } else {
        alert('Failed to generate code');
      }
    } catch (error) {
      alert('Error generating code');
    }
    setIsGenerating(false);
  };

  const handleGenerateAiCode = async () => {
    setIsGenerating(true);
    setNewCode(null);
    try {
      const result = await generateAiCodeManually();
      if (result.success && result.code) {
        setNewCode(result.code);
        setTimeout(() => setNewCode(null), 5000);
        if (onRefresh) onRefresh();
      } else {
        alert('Failed to generate AI code');
      }
    } catch (error) {
      alert('Error generating AI code');
    }
    setIsGenerating(false);
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">{t.adminDashboard}</h1>
          <p className="text-slate-600 mt-2">
            {t.adminDesc}
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleGenerateCode}
            disabled={isGenerating}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isGenerating ? (
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            )}
            PRO
          </button>
          
          <button 
            onClick={handleGenerateAiCode}
            disabled={isGenerating}
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isGenerating ? (
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
            )}
            PRO + ИИ
          </button>
        </div>
      </div>

      {newCode && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center justify-between">
          <div>
            <p className="text-green-800 font-semibold mb-1">✓ {t.codeGeneratedSuccess}</p>
            <p className="text-green-700 font-mono text-lg">{newCode}</p>
          </div>
          <button 
            onClick={() => setNewCode(null)}
            className="text-green-600 hover:text-green-800"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="p-4 font-semibold text-slate-600">ID</th>
              <th className="p-4 font-semibold text-slate-600">Code</th>
              <th className="p-4 font-semibold text-slate-600">Email</th>
              <th className="p-4 font-semibold text-slate-600">Status</th>
              <th className="p-4 font-semibold text-slate-600">Device ID</th>
              <th className="p-4 font-semibold text-slate-600">Created At</th>
              <th className="p-4 font-semibold text-slate-600">Activated At</th>
              <th className="p-4 font-semibold text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {codes.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-slate-500">
                  {t.noCodes}
                </td>
              </tr>
            ) : (
              codes.map((c) => (
                <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-4 text-slate-500">{c.id}</td>
                  <td className="p-4 font-mono text-slate-800 font-medium">{c.code}</td>
                  <td className="p-4 text-slate-600 text-sm">{c.email || '-'}</td>
                  <td className="p-4">
                    {c.isUsed ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {t.statusUsed}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {t.statusUnused}
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-slate-500 font-mono text-sm">
                    {c.deviceId ? c.deviceId.substring(0, 8) + '...' : '-'}
                  </td>
                  <td className="p-4 text-slate-500 text-sm">{new Date(c.createdAt).toLocaleString()}</td>
                  <td className="p-4 text-slate-500 text-sm">{c.activatedAt ? new Date(c.activatedAt).toLocaleString() : '-'}</td>
                  <td className="p-4">
                    {c.isUsed && (
                      <form action={async () => {
                        await resetCodeDevice(c.id);
                        // Refresh the table after reset
                        if (onRefresh) onRefresh();
                      }}>
                        <button 
                          type="submit" 
                          className="text-xs bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded border border-red-200 transition-colors"
                        >
                          {t.resetDevice}
                        </button>
                      </form>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
