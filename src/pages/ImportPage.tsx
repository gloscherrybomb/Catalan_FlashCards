import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Upload,
  CheckCircle,
  AlertCircle,
  Download,
  X,
  ClipboardPaste,
  FileText,
} from 'lucide-react';
import { useCardStore } from '../stores/cardStore';
import { Button } from '../components/ui/Button';
import { Card, CardTitle } from '../components/ui/Card';
import { exportToCSV } from '../services/csvParser';

type ImportMode = 'file' | 'paste';

export function ImportPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; count: number; error?: string } | null>(null);
  const [previewContent, setPreviewContent] = useState<string | null>(null);
  const [importMode, setImportMode] = useState<ImportMode>('file');
  const [pasteContent, setPasteContent] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const importCSV = useCardStore((state) => state.importCSV);
  const flashcards = useCardStore((state) => state.flashcards);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      await processFile(file);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processFile(file);
    }
  };

  const processFile = async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      setResult({ success: false, count: 0, error: 'Please upload a CSV file' });
      return;
    }

    try {
      const content = await file.text();
      setPreviewContent(content);
    } catch (error) {
      setResult({ success: false, count: 0, error: 'Failed to read file' });
    }
  };

  const handleImport = async () => {
    if (!previewContent) return;

    setImporting(true);
    setResult(null);

    try {
      const count = await importCSV(previewContent);
      setResult({ success: true, count });
      setPreviewContent(null);
    } catch (error) {
      setResult({
        success: false,
        count: 0,
        error: error instanceof Error ? error.message : 'Import failed',
      });
    } finally {
      setImporting(false);
    }
  };

  const handleExport = () => {
    const csv = exportToCSV(flashcards);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'catalan-flashcards.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePastePreview = () => {
    if (pasteContent.trim()) {
      setPreviewContent(pasteContent);
    }
  };

  // Parse preview content for display
  const previewRows = previewContent
    ? previewContent.split('\n').filter(row => row.trim()).slice(0, 6)
    : [];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Import Cards</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">
        Upload CSV files or paste text from your Gemini AI Catalan lessons
      </p>

      {/* Mode toggle */}
      <div className="flex gap-2 mb-6 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg w-fit">
        <button
          onClick={() => setImportMode('file')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
            importMode === 'file'
              ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-white shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <FileText className="w-4 h-4" />
          Upload File
        </button>
        <button
          onClick={() => setImportMode('paste')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
            importMode === 'paste'
              ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-white shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <ClipboardPaste className="w-4 h-4" />
          Paste Text
        </button>
      </div>

      {/* File drop zone */}
      {importMode === 'file' && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-colors ${
            isDragging
              ? 'border-primary bg-primary/5 dark:bg-primary/10'
              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            className="hidden"
          />

          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
            <Upload size={32} className="text-gray-400" />
          </div>

          <h3 className="font-bold text-gray-800 dark:text-white mb-2">
            Drop your CSV file here
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">or</p>

          <Button onClick={() => fileInputRef.current?.click()}>
            Browse Files
          </Button>
        </div>
      )}

      {/* Paste text area */}
      {importMode === 'paste' && !previewContent && (
        <div className="space-y-4">
          <div className="relative">
            <textarea
              value={pasteContent}
              onChange={(e) => setPasteContent(e.target.value)}
              placeholder="Paste your CSV content here...

Example:
Category,Front,Back,Notes
Basics,Hello,Hola,Greeting
Basics,Thank you,Gràcies,Courtesy
Food & Drink,Bread,Pa (M),Noun
Grammar,I am,Jo sóc,Verb: Ser"
              className="w-full h-64 p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl
                       bg-white dark:bg-gray-800 text-gray-800 dark:text-white
                       placeholder-gray-400 dark:placeholder-gray-500
                       focus:border-primary focus:outline-none resize-none font-mono text-sm"
            />
            <div className="absolute bottom-3 right-3 text-xs text-gray-400">
              {pasteContent.split('\n').filter(l => l.trim()).length} lines
            </div>
          </div>
          <Button
            onClick={handlePastePreview}
            disabled={!pasteContent.trim()}
            fullWidth
          >
            Preview Import
          </Button>
        </div>
      )}

      {/* Preview */}
      {previewContent && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6"
        >
          <Card>
            <div className="flex items-center justify-between mb-4">
              <CardTitle>Preview</CardTitle>
              <button
                onClick={() => {
                  setPreviewContent(null);
                  setPasteContent('');
                }}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    {previewRows[0]?.split(',').map((header, i) => (
                      <th key={i} className="text-left py-2 px-3 font-medium text-gray-700 dark:text-gray-300">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewRows.slice(1, 5).map((row, i) => (
                    <tr key={i} className="border-b border-gray-50 dark:border-gray-800">
                      {row.split(',').map((cell, j) => (
                        <td key={j} className="py-2 px-3 text-gray-600 dark:text-gray-400">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {previewRows.length > 5 && (
              <p className="text-sm text-gray-400 mt-2">
                +{previewRows.length - 5} more rows
              </p>
            )}

            <div className="mt-6 flex gap-3">
              <Button
                variant="ghost"
                onClick={() => {
                  setPreviewContent(null);
                  setPasteContent('');
                }}
              >
                Cancel
              </Button>
              <Button
                fullWidth
                onClick={handleImport}
                isLoading={importing}
              >
                Import {previewRows.length - 1} Cards
              </Button>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Result message */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-6 p-4 rounded-xl flex items-center gap-3 ${
            result.success
              ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
              : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
          }`}
        >
          {result.success ? (
            <CheckCircle size={24} />
          ) : (
            <AlertCircle size={24} />
          )}
          <div>
            {result.success ? (
              <p className="font-medium">
                Successfully imported {result.count} new cards!
              </p>
            ) : (
              <p className="font-medium">{result.error}</p>
            )}
          </div>
        </motion.div>
      )}

      {/* CSV format help */}
      <Card className="mt-8">
        <CardTitle>CSV Format</CardTitle>
        <p className="text-gray-600 dark:text-gray-400 mt-2 mb-4">
          Your CSV should have these columns:
        </p>

        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 font-mono text-sm overflow-x-auto">
          <div className="text-gray-500 dark:text-gray-400">Category,Front,Back,Notes</div>
          <div className="text-gray-700 dark:text-gray-300">Grammar,I am (identity),Jo sóc,Verb: Ser</div>
          <div className="text-gray-700 dark:text-gray-300">Food & Drink,Bread,Pa (M),Noun</div>
          <div className="text-gray-700 dark:text-gray-300">Basics,Thank you,Gràcies,Courtesy</div>
          <div className="text-gray-700 dark:text-gray-300">Adjectives,Big,Gran,Matches gender</div>
        </div>

        <ul className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span><strong className="dark:text-gray-200">Category:</strong> Group like Grammar, Verbs, Food & Drink, Basics, etc.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span><strong className="dark:text-gray-200">Front:</strong> English word or phrase</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span><strong className="dark:text-gray-200">Back:</strong> Catalan translation - include (M) or (F) for gender</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span><strong className="dark:text-gray-200">Notes:</strong> Grammar hints or additional context (optional)</span>
          </li>
        </ul>
      </Card>

      {/* Export option */}
      {flashcards.length > 0 && (
        <Card className="mt-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Export Cards</CardTitle>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Download your {flashcards.length} cards as CSV
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleExport}
              leftIcon={<Download size={18} />}
            >
              Export
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
