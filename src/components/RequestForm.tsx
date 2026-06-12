import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PlusCircle, Search, Sparkles, Building2, HelpCircle, Receipt } from 'lucide-react';
import { Supplier, PurchaseRequest, RequestStatus } from '../types';

interface RequestFormProps {
  suppliers: Supplier[];
  onAddRequest: (requestId: string, supplierName: string, description: string, value: number, status: RequestStatus) => void;
  onAddSupplierOnly: (name: string, category: string) => void;
}

export default function RequestForm({ suppliers, onAddRequest, onAddSupplierOnly }: RequestFormProps) {
  const [requestId, setRequestId] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [description, setDescription] = useState('');
  const [value, setValue] = useState('');
  const [status, setStatus] = useState<RequestStatus>('Pendente');
  
  // UI states
  const [isFocused, setIsFocused] = useState(false);
  const [showNewSupplierBadge, setShowNewSupplierBadge] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Check if typed supplier name is new
  useEffect(() => {
    if (!supplierName.trim()) {
      setShowNewSupplierBadge(false);
      return;
    }
    
    const exists = suppliers.some(
      (s) => s.name.toLowerCase() === supplierName.trim().toLowerCase()
    );
    setShowNewSupplierBadge(!exists);
  }, [supplierName, suppliers]);

  // Handle outside click to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredSuppliers = suppliers.filter((s) =>
    s.name.toLowerCase().includes(supplierName.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestId.trim() || !supplierName.trim()) return;

    // clean requisition ID for premium standard format
    const cleanedId = requestId.trim().toUpperCase();
    const finalSupplierName = supplierName.trim();
    const numericValue = parseFloat(value) || 0;
    
    onAddRequest(
      cleanedId,
      finalSupplierName,
      description.trim() || 'Sem descrição detalhada',
      numericValue,
      status
    );

    // Dynamic success feedback indicating smart routing
    let msg = `Sucesso! Solicitação ${cleanedId} encaminhada automaticamente para a gaveta de "${finalSupplierName}".`;
    if (showNewSupplierBadge) {
      msg = `Sucesso! Novo fornecedor "${finalSupplierName}" cadastrado e ID ${cleanedId} encaminhado ao seu dashboard exclusivo!`;
    }
    setSuccessMessage(msg);
    
    // Reset values
    setRequestId('');
    setSupplierName('');
    setDescription('');
    setValue('');
    setStatus('Pendente');
    setShowNewSupplierBadge(false);

    setTimeout(() => {
      setSuccessMessage(null);
    }, 5000);
  };

  // Generate a random ID for prototyping convenience
  const generateRandomId = () => {
    const num = Math.floor(100000 + Math.random() * 900000);
    setRequestId(`ID${num}`);
  };

  return (
    <div id="request-form-container" className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 bg-linear-to-r from-slate-50 to-white">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-900 rounded-xl text-white">
            <PlusCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-sans font-semibold text-slate-900 text-lg">Portal de Solicitações</h2>
            <p className="text-xs text-slate-500 font-sans mt-0.5">Lançamento e Roteamento Automático de IDs</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        <AnimatePresence mode="popLayout">
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800 text-xs flex items-start gap-2.5"
            >
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Requisition ID */}
        <div className="grid grid-cols-1 gap-2">
          <div className="flex justify-between items-center">
            <label htmlFor="req-id-input" className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Receipt className="w-3.5 h-3.5 text-slate-500" />
              ID de Solicitação de Compra
            </label>
            <button
              type="button"
              onClick={generateRandomId}
              className="text-[10px] bg-slate-100 text-slate-700 hover:bg-slate-200 px-2 py-1 rounded-md font-medium transition-colors"
            >
              Gerar ID Aleatório
            </button>
          </div>
          <div className="relative">
            <input
              id="req-id-input"
              type="text"
              required
              value={requestId}
              onChange={(e) => setRequestId(e.target.value)}
              placeholder="Ex: ID145978 ou 145978"
              className="w-full text-sm font-mono font-medium px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-shadow bg-slate-50 placeholder:font-sans placeholder:text-slate-400 placeholder:text-xs"
            />
          </div>
        </div>

        {/* Supplier Autocomplete Input */}
        <div className="grid grid-cols-1 gap-2 relative" ref={dropdownRef}>
          <label htmlFor="supplier-name-input" className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-slate-500" />
            Nome do Fornecedor
          </label>
          <div className="relative">
            <input
              id="supplier-name-input"
              type="text"
              required
              autoComplete="off"
              value={supplierName}
              onChange={(e) => {
                setSupplierName(e.target.value);
                setIsFocused(true);
              }}
              onFocus={() => setIsFocused(true)}
              placeholder="Digite o nome (ex: Opção Informática)"
              className="w-full text-sm font-medium px-4 py-3 pr-10 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-shadow"
            />
            <div className="absolute right-3 top-3.5 text-slate-400">
              <Search className="w-4 h-4" />
            </div>
          </div>

          {/* Autocomplete Dropdown */}
          <AnimatePresence>
            {isFocused && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute left-0 right-0 top-[76px] z-20 bg-white border border-slate-150 rounded-xl shadow-lg max-h-48 overflow-y-auto"
              >
                {filteredSuppliers.length > 0 ? (
                  <div className="p-1">
                    <p className="text-[10px] font-semibold text-slate-400 px-3 py-1.5 uppercase hover:bg-transparent">
                      Sugestões Existentes
                    </p>
                    {filteredSuppliers.map((supplier) => (
                      <button
                        key={supplier.id}
                        type="button"
                        onClick={() => {
                          setSupplierName(supplier.name);
                          setIsFocused(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-slate-50 flex justify-between items-center transition-colors"
                      >
                        <span className="font-semibold text-slate-800">{supplier.name}</span>
                        {supplier.category && (
                          <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full uppercase">
                            {supplier.category}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 text-center">
                    <p className="text-xs font-medium text-slate-500">
                      Nenhum fornecedor correspondente.
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsFocused(false)}
                      className="text-[10px] text-slate-900 font-bold underline mt-1"
                    >
                      Criar novo fornecedor abaixo
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Smart indicator for dynamic suppliers */}
          <AnimatePresence>
            {showNewSupplierBadge && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div id="new-supplier-notice" className="p-2.5 bg-sky-50 border border-sky-100 rounded-xl text-sky-800 text-[11px] flex gap-2 items-center">
                  <Sparkles className="w-3.5 h-3.5 text-sky-600 animate-pulse shrink-0" />
                  <span>
                    O fornecedor <strong>"{supplierName}"</strong> não está cadastrado. Nós o registraremos de forma automática para receber este ID!
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Value and Status Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="grid grid-cols-1 gap-2">
            <label htmlFor="value-input" className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Valor Est. (R$)
            </label>
            <input
              id="value-input"
              type="number"
              min="0"
              step="0.01"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="R$ 0,00"
              className="w-full text-sm font-semibold px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-shadow"
            />
          </div>

          <div className="grid grid-cols-1 gap-2">
            <label htmlFor="status-select" className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Status Inicial
            </label>
            <select
              id="status-select"
              value={status}
              onChange={(e) => setStatus(e.target.value as RequestStatus)}
              className="w-full text-sm px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-shadow bg-white text-slate-800"
            >
              <option value="Pendente">⏱️ Pendente</option>
              <option value="Em Cotação">🔍 Em Cotação</option>
              <option value="Enviado">📨 Enviado</option>
              <option value="Concluído">✅ Concluído</option>
              <option value="Cancelado">❌ Cancelado</option>
            </select>
          </div>
        </div>

        {/* Short description */}
        <div className="grid grid-cols-1 gap-2">
          <label htmlFor="description-input" className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Resumo da Demanda
          </label>
          <input
            id="description-input"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ex: Aquisição de monitores novos, mouses, etc."
            className="w-full text-sm px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-shadow"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-sm transition-all duration-200 active:scale-[0.98] shadow-sm flex items-center justify-center gap-2"
        >
          <span>Encaminhar ID para Fornecedor</span>
          <PlusCircle className="w-4 h-4" />
        </button>
      </form>

      {/* Guide Card */}
      <div className="mx-6 mb-6 p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-3">
        <HelpCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <div className="text-[11px] text-slate-500 leading-relaxed font-sans">
          <span className="font-semibold text-slate-700">Roteamento Instantâneo:</span> Quando você lança o ID, o sistema isola o registro e o envia diretamente para a seção exclusiva do fornecedor escolhido. O setor de compras só precisa consultar a gaveta específica de cada parceiro.
        </div>
      </div>
    </div>
  );
}
