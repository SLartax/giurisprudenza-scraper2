import React, { useState } from 'react';
import { Copy, Terminal, AlertTriangle, ExternalLink } from 'lucide-react';

const pythonScript = `from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select
import time

# Configurazione del Driver
def make_driver():
    opts = Options()
    # opts.add_argument("--headless=new") # Decommentare per esecuzione nascosta
    opts.add_argument("--no-sandbox")
    opts.add_argument("--disable-dev-shm-usage")
    opts.add_argument("--window-size=1920,1080")
    
    # IMPORTANTE: Aggiorna questi percorsi con i tuoi percorsi locali
    # driver_service = Service("./chromedriver") 
    driver = webdriver.Chrome(options=opts) # Assicurati che chromedriver sia nel PATH
    return driver

def main():
    driver = make_driver()
    wait = WebDriverWait(driver, 30)

    try:
        print(">>> Accesso alla banca dati...")
        driver.get("https://bancadatigiurisprudenza.giustiziatributaria.gov.it/ricerca")
        
        # Selezione Anno 2025
        print(">>> Selezione anno 2025...")
        anno_select = wait.until(EC.visibility_of_element_located(
            (By.XPATH, "//select[@id='anno']") # Selettore ottimizzato, potrebbe variare
        ))
        Select(anno_select).select_by_value("2025")

        # Selezione Esito
        print(">>> Selezione esito favorevole...")
        # Nota: L'XPath è generico, potrebbe richiedere aggiustamenti in base al DOM reale
        esito_select = wait.until(EC.visibility_of_element_located(
            (By.XPATH, "//label[contains(text(),'Esito')]/following::select[1]")
        ))
        Select(esito_select).select_by_visible_text("Favorevole al contribuente")

        # Click Ricerca
        print(">>> Avvio ricerca...")
        ricerca_btn = driver.find_element(By.XPATH, "//button[contains(.,'Ricerca')]")
        ricerca_btn.click()
        
        # Attesa Risultati
        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "table.result-table")))
        
        # Apertura Primo Risultato
        print(">>> Apertura primo dettaglio...")
        first_link = wait.until(EC.element_to_be_clickable(
            (By.CSS_SELECTOR, "table tr:nth-child(1) a.dettaglio")
        ))
        first_link.click()

        # Estrazione Testo
        print(">>> Estrazione testo...")
        content_div = wait.until(EC.presence_of_element_located(
            (By.CLASS_NAME, "testo-sentenza")
        ))
        
        full_text = content_div.text
        print(f"Testo estratto ({len(full_text)} caratteri)")

        # Salvataggio
        with open("sentenza_output.txt", "w", encoding="utf-8") as f:
            f.write(full_text)
            
        print(">>> Salvataggio completato in sentenza_output.txt")

    except Exception as e:
        print(f"ERRORE: {e}")
        # Suggerimento debug: driver.save_screenshot('error.png')
    
    finally:
        # driver.quit() # Decommenta per chiudere automaticamente
        pass

if __name__ == "__main__":
    main()
`;

const ScriptViewer: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(pythonScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-judicial-900 font-serif">Script di Estrazione Dati</h1>
          <p className="text-judicial-500 mt-1">
            Codice Python ottimizzato per lo scraping della Banca Dati Giurisprudenza.
          </p>
        </div>
        <button
          onClick={handleCopy}
          className={`
            flex items-center px-4 py-2 rounded-lg font-medium transition-all
            ${copied 
              ? 'bg-green-100 text-green-700 border border-green-200' 
              : 'bg-judicial-800 text-white hover:bg-judicial-700 shadow-md'}
          `}
        >
          {copied ? <span className="mr-2">Copiato!</span> : <Copy size={18} className="mr-2" />}
          {copied ? 'Salvato negli appunti' : 'Copia Script'}
        </button>
      </div>

      <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-r-lg flex items-start">
        <AlertTriangle className="text-orange-500 mr-3 mt-1 flex-shrink-0" size={20} />
        <div>
          <h4 className="font-bold text-orange-800">Limitazione Browser</h4>
          <p className="text-sm text-orange-700 mt-1">
            Per motivi di sicurezza (CORS e Sandbox), le applicazioni web non possono eseguire direttamente Selenium o connettersi ai siti governativi. 
            Copia questo script ed eseguilo sul tuo terminale locale.
          </p>
        </div>
      </div>

      <div className="relative rounded-xl overflow-hidden shadow-lg border border-judicial-200">
        <div className="bg-judicial-900 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <div className="text-judicial-300 text-xs font-mono flex items-center">
            <Terminal size={12} className="mr-1" />
            scraper.py
          </div>
        </div>
        <div className="bg-gray-900 p-4 overflow-x-auto">
          <pre className="font-mono text-sm text-gray-300 leading-relaxed">
            <code>{pythonScript}</code>
          </pre>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-judicial-100 shadow-sm">
        <h3 className="font-bold text-lg mb-4 text-judicial-800">Istruzioni per l'uso</h3>
        <ol className="list-decimal list-inside space-y-3 text-judicial-600">
          <li>Assicurati di avere <code className="bg-gray-100 px-1 py-0.5 rounded text-red-500">Python 3.8+</code> installato.</li>
          <li>Installa Selenium: <code className="bg-gray-100 px-1 py-0.5 rounded font-mono">pip install selenium</code>.</li>
          <li>Scarica il <a href="#" className="text-blue-600 hover:underline inline-flex items-center">ChromeDriver <ExternalLink size={12} className="ml-1"/></a> compatibile con la tua versione di Chrome.</li>
          <li>Incolla lo script in un file chiamato <code className="font-mono text-judicial-800">scraper.py</code>.</li>
          <li>Esegui il file. Il testo estratto verrà salvato nella stessa cartella.</li>
          <li>Torna qui e incolla il testo nella sezione <strong>"Analisi AI"</strong> per processarlo.</li>
        </ol>
      </div>
    </div>
  );
};

export default ScriptViewer;