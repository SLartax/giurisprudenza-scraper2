import React, { useState } from 'react';
import { analyzeLegalText } from '../services/geminiService';
import { AnalysisResult } from '../types';
import { Sparkles, FileText, AlertCircle, Check, X, ArrowRight } from 'lucide-react';

const Analyzer: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalysis = async () => {
    if (!inputText.trim()) return;
    
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await analyzeLegalText(inputText);
      setResult(data);
    } catch (err) {
      setError("Errore durante l'analisi. Verifica la tua API Key o riprova più tardi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-8rem)]">
      {/* Input Section */}
      <div className="flex flex-col h-full space-y-4">
        <div className="flex justify-between items-center">
            <h2 className="text-xl font-serif font-bold text-judicial-900 flex items-center">
                <FileText className="mr-2" size={24} />
                Testo Sentenza
            </h2>
            <button
                onClick={() => setInputText('')}
                className="text-sm text-judicial-500 hover:text-red-500 transition-colors"
            >
                Pulisci
            </button>
        </div>
        
        <textarea
          className="flex-1 w-full p-4 rounded-xl border border-judicial-200 shadow-sm focus:ring-2 focus:ring-judicial-500 focus:border-transparent resize-none font-mono text-sm leading-relaxed bg-white"
          placeholder="Incolla qui il testo estratto dalla sentenza (es. il contenuto di 'sentenza_output.txt')..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
        
        <button
          onClick={handleAnalysis}
          disabled={loading || !inputText}
          className={`
            w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all flex items-center justify-center
            ${loading || !inputText 
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
              : 'bg-gradient-to-r from-judicial-800 to-judicial-700 text-white hover:from-judicial-900 hover:to-judicial-800 transform hover:-translate-y-1'}
          `}
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analisi in corso...
            </>
          ) : (
            <>
              <Sparkles className="mr-2" /> Analizza con Gemini
            </>
          )}
        </button>

        {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg flex items-center text-sm">
                <AlertCircle size={16} className="mr-2" />
                {error}
            </div>
        )}
      </div>

      {/* Output Section */}
      <div className="flex flex-col h-full bg-white rounded-xl shadow-lg border border-judicial-100 overflow-hidden">
        <div className="bg-judicial-50 p-4 border-b border-judicial-100 flex justify-between items-center">
             <h2 className="text-xl font-serif font-bold text-judicial-900">Analisi Legale</h2>
             {result && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold">COMPLETATA</span>}
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          {!result ? (
            <div className="h-full flex flex-col items-center justify-center text-judicial-300 space-y-4">
              <ScaleIcon />
              <p className="text-center max-w-xs">
                In attesa di dati. Inserisci il testo a sinistra per ricevere un'analisi strutturata.
              </p>
            </div>
          ) : (
            <div className="space-y-6 animate-fade-in">
                {/* Outcome Badge */}
                <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                    <div>
                        <p className="text-xs text-judicial-400 uppercase tracking-wider font-bold">Esito Contribuente</p>
                        <h3 className={`text-2xl font-bold mt-1 ${
                            result.outcome === 'FAVOREVOLE' ? 'text-green-600' :
                            result.outcome === 'SFAVOREVOLE' ? 'text-red-600' :
                            'text-orange-600'
                        }`}>
                            {result.outcome}
                        </h3>
                    </div>
                    <div>
                        <p className="text-xs text-judicial-400 uppercase tracking-wider font-bold text-right">Anno</p>
                        <p className="text-xl font-bold text-judicial-800 text-right">{result.year}</p>
                    </div>
                </div>

                {/* Summary */}
                <div>
                    <h4 className="flex items-center text-judicial-800 font-bold mb-2">
                        <FileText size={18} className="mr-2 text-judicial-500" />
                        Sintesi del Caso
                    </h4>
                    <p className="text-judicial-600 leading-relaxed bg-judicial-50 p-4 rounded-lg border-l-4 border-judicial-300">
                        {result.summary}
                    </p>
                </div>

                {/* Key Points */}
                <div>
                    <h4 className="flex items-center text-judicial-800 font-bold mb-2">
                        <Check size={18} className="mr-2 text-judicial-500" />
                        Punti Chiave
                    </h4>
                    <ul className="space-y-2">
                        {result.keyPoints.map((point, idx) => (
                            <li key={idx} className="flex items-start text-sm text-judicial-700">
                                <span className="mr-2 mt-1.5 w-1.5 h-1.5 bg-yellow-500 rounded-full flex-shrink-0"></span>
                                {point}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Judge & Laws */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white border border-judicial-100 p-4 rounded-lg">
                        <h5 className="text-xs font-bold text-judicial-400 uppercase mb-2">Organo Giudicante</h5>
                        <p className="text-judicial-800 font-medium">{result.judge || "Non rilevato"}</p>
                    </div>
                    <div className="bg-white border border-judicial-100 p-4 rounded-lg">
                        <h5 className="text-xs font-bold text-judicial-400 uppercase mb-2">Riferimenti Normativi</h5>
                        <div className="flex flex-wrap gap-2">
                            {result.legalReferences.map((ref, idx) => (
                                <span key={idx} className="bg-judicial-100 text-judicial-700 text-xs px-2 py-1 rounded hover:bg-judicial-200 transition-colors cursor-default">
                                    {ref}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ScaleIcon = () => (
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-judicial-200">
        <path d="M12 3V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M5 10L12 3L19 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M5 14C5 14 6 20 10 20C14 20 15 14 15 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M19 14C19 14 18 20 14 20C10 20 9 14 9 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M5 10V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M19 10V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

export default Analyzer;