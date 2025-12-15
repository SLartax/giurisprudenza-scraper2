import React, { useState } from 'react';
import { RefreshCw, Scale, FileText, X, ExternalLink } from 'lucide-react';
import { analyzeLegalText } from '../services/geminiService';
import { AnalysisResult } from '../types';

const Dashboard: React.FC = () => {
  // Mock data based on user provided "CGT 2° Sicilia" judgment
  const mockJudgment: AnalysisResult & { id: string } = {
    id: "CGT-SICILIA-2025-6395",
    judge: "Corte di Giustizia Tributaria di II Grado della Sicilia",
    caseNumber: "Sentenza n. 6395/2025",
    year: "2025",
    outcome: "FAVOREVOLE",
    summary: "La Corte ha accolto l'appello del contribuente affermando il principio di diritto secondo cui l'Amministrazione finanziaria ha l'onere di provare la pretesa impositiva con elementi certi e precisi. In assenza di una motivazione adeguata nell'atto di accertamento riguardo ai presupposti impositivi, l'atto deve essere annullato per violazione del diritto di difesa e del principio di capacità contributiva.",
    keyPoints: ["Onere della prova a carico dell'Ufficio", "Carenza di motivazione dell'atto impositivo", "Annullamento per vizio formale e sostanziale"],
    legalReferences: ["D.Lgs 546/1992", "Art. 7 Statuto del Contribuente"]
  };

  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentData, setCurrentData] = useState<AnalysisResult | null>(null);
  const [showFullText, setShowFullText] = useState(false);

  // Logic: Initial load shows Mock. 
  // User clears mock (Reset) -> Shows Input.
  // User analyzes -> Shows Result.
  
  // By default, if we haven't analyzed anything yet, we show the mock judgment provided by user context
  const displayData = currentData || (inputText === '' ? mockJudgment : null); 
  const isMock = !currentData && displayData === mockJudgment;

  const handleAnalysis = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    try {
      const result = await analyzeLegalText(inputText);
      setCurrentData(result);
    } catch (err) {
      alert("Errore nell'analisi del testo.");
    } finally {
      setLoading(false);
    }
  };

  const showInputView = !displayData;

  // 1. INPUT VIEW (Show only if manually reset or no mock)
  if (showInputView) {
    return (
      <div className="w-full max-w-2xl animate-fade-in">
        <div className="bg-white p-8 md:p-12 shadow-2xl rounded-sm border-t-4 border-gray-900">
            <div className="flex justify-center mb-8">
                <Scale className="w-12 h-12 text-gray-800" />
            </div>
            
            <h1 className="text-2xl text-center font-bold text-gray-900 mb-8 tracking-tight">
                Nuova Analisi Giurisprudenziale
            </h1>

            <textarea
                className="w-full p-6 bg-gray-50 border border-gray-200 focus:outline-none focus:border-gray-400 focus:ring-0 font-mono text-sm h-64 resize-none mb-6 text-gray-600 transition-colors"
                placeholder="Incolla qui il testo integrale della sentenza..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
            />

            <button
                onClick={handleAnalysis}
                disabled={loading || !inputText.trim()}
                className="w-full py-4 bg-gray-900 text-white font-bold tracking-widest hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
            >
                {loading ? "ELABORAZIONE IN CORSO..." : "ANALIZZA SENTENZA"}
            </button>
            
             <div className="mt-4 text-center">
                 <button 
                    onClick={() => { setInputText(''); setCurrentData(null); }} 
                    className="text-xs text-gray-400 hover:text-gray-600 underline"
                 >
                    Torna all'esempio
                 </button>
            </div>
        </div>
      </div>
    );
  }

  // 2. RESULT VIEW
  return (
    <div className="w-full max-w-3xl animate-fade-in relative">
      
      {/* Floating Reset Button */}
      <button 
        onClick={() => { setCurrentData(null); setInputText(' '); }}
        className="fixed top-6 right-6 md:absolute md:top-0 md:-right-16 bg-white p-3 rounded-full shadow-md text-gray-400 hover:text-gray-900 transition-colors z-50"
        title="Nuova Ricerca"
      >
        <RefreshCw size={20} />
      </button>

      {/* Main Paper Card */}
      <div className="bg-white shadow-2xl p-12 md:p-20 relative">
        
        {/* Header */}
        <div className="text-center border-b-2 border-gray-900 pb-10 mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                {displayData.judge}
            </h1>
            <div className="inline-block bg-gray-900 text-white px-4 py-1 text-sm font-bold tracking-wider">
                {displayData.caseNumber || `ANNO ${displayData.year}`}
            </div>
             {isMock && (
                <div className="mt-2 text-xs text-green-600 font-bold tracking-widest uppercase">
                    Dato più recente (Banca Dati Giustizia Tributaria)
                </div>
            )}
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none text-justify">
            <p className="text-gray-800 text-xl leading-relaxed font-serif italic border-l-4 border-gray-300 pl-6">
                "{displayData.summary}"
            </p>
        </div>

        {/* Footer Link */}
        <div className="mt-16 pt-8 border-t border-gray-100 flex flex-col items-center space-y-4">
            <button 
                onClick={() => setShowFullText(true)}
                className="text-blue-900 hover:text-blue-700 font-bold border-b border-blue-900 hover:border-blue-700 pb-0.5 text-sm uppercase tracking-wide flex items-center"
            >
                <FileText size={16} className="mr-2" />
                Visualizza Testo Integrale
            </button>

            <p className="text-gray-400 italic text-sm mt-8 font-serif">
                by Studio Legale Artax
            </p>
        </div>
      </div>

      {/* Full Text Modal Overlay */}
      {showFullText && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-4xl h-[80vh] flex flex-col shadow-2xl animate-fade-in">
                <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gray-50">
                    <h3 className="font-bold text-gray-900 flex items-center">
                        <FileText className="mr-2" size={20}/>
                        Testo Integrale Sentenza
                    </h3>
                    <button onClick={() => setShowFullText(false)} className="text-gray-500 hover:text-red-500">
                        <X size={24} />
                    </button>
                </div>
                <div className="flex-1 overflow-auto p-8 bg-white">
                    {isMock ? (
                        <div className="text-center py-12 space-y-6">
                            <p className="text-gray-600">
                                Il testo integrale di questa sentenza (n. 6395/2025) è disponibile sulla Banca Dati della Giustizia Tributaria.
                            </p>
                            <div className="p-4 bg-gray-100 rounded inline-block text-left text-sm font-mono text-gray-700">
                                <strong>Estremi:</strong><br/>
                                Numero: 6395<br/>
                                Anno: 2025<br/>
                                Data Deposito: 18/09/2025<br/>
                                Valore: € 1.215,63
                            </div>
                            <br/>
                            <a 
                                href="https://bancadatigiurisprudenza.giustiziatributaria.gov.it/ricerca" 
                                target="_blank" 
                                rel="noreferrer"
                                className="inline-flex items-center text-blue-600 hover:underline font-bold"
                            >
                                Vai alla Banca Dati <ExternalLink size={16} className="ml-1"/>
                            </a>
                        </div>
                    ) : (
                        <pre className="whitespace-pre-wrap font-mono text-sm text-gray-700 leading-relaxed">
                            {inputText}
                        </pre>
                    )}
                </div>
                <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end">
                     <button 
                        onClick={() => setShowFullText(false)}
                        className="px-6 py-2 bg-gray-900 text-white font-bold text-sm hover:bg-gray-800"
                    >
                        CHIUDI
                    </button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;