import React from 'react';

export interface AnalysisResult {
  summary: string;
  outcome: 'FAVOREVOLE' | 'SFAVOREVOLE' | 'PARZIALE' | 'RINVIO' | 'UNKNOWN';
  judge: string;
  year: string;
  caseNumber?: string;
  legalReferences: string[];
  keyPoints: string[];
}

export interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}