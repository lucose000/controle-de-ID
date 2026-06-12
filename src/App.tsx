import React, { useState, useEffect, useMemo } from 'react';
import { 
  Building2, 
  Layers, 
  HelpCircle, 
  Info, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  ArrowRightLeft,
  Search,
  Filter,
  Copy,
  Check,
  Trash2,
  Briefcase,
  Mail,
  User,
  Calendar,
  FileSpreadsheet,
  PlusCircle,
  Menu,
  X,
  Sparkles,
  RefreshCw,
  FolderSync,
  Layers2,
  Store // Store icon added for physical filiais
} from 'lucide-react';
import { Supplier, PurchaseRequest, RequestStatus } from './types';
import { INITIAL_SUPPLIERS, INITIAL_REQUESTS, BRANCHES_EX } from './data/initialData';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  // Load initial states from LocalStorage or seed defaults
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const saved = localStorage.getItem('sra_suppliers');
    return saved ? JSON.parse(saved) : INITIAL_SUPPLIERS;
  });

  const [requests, setRequests] = useState<PurchaseRequest[]>(() => {
    const saved = localStorage.getItem('sra_requests');
    return saved ? JSON.parse(saved) : INITIAL_REQUESTS;
  });

  // Selected supplier in sidebar view ('all' / 'global' means central dashboard, or we can select a specific supplier)
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('global');

  // Input states for top quick-launch form
  const [newRequestId, setNewRequestId] = useState('');
  const [newSupplierName, setNewSupplierName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newStatus, setNewStatus] = useState<RequestStatus>('Pendente');
  
  // Selected Branch (Selected Store among the 34 stores)
  const [newBranch, setNewBranch] = useState<string>(BRANCHES_EX[0]);

  // Autocomplete suggestions and validation states
  const [isFocused, setIsFocused] = useState(false);
  const [showNewSupplierBadge, setShowNewSupplierBadge] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [branchFilter, setBranchFilter] = useState<string>('all');
  
  // Mobile UI controls
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);
  
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem('sra_suppliers', JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    localStorage.setItem('sra_requests', JSON.stringify(requests));
  }, [requests]);

  // Handle outside click to close supplier suggestions
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Check if typed supplier is virtual/new
  useEffect(() => {
    if (!newSupplierName.trim()) {
      setShowNewSupplierBadge(false);
      return;
    }
    const exists = suppliers.some(
      (s) => s.name.toLowerCase() === newSupplierName.trim().toLowerCase()
    );
    setShowNewSupplierBadge(!exists);
  }, [newSupplierName, suppliers]);

  // Handle dynamic routing and request addition
  const handleAddRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRequestId.trim() || !newSupplierName.trim()) return;

    const cleanedId = newRequestId.trim().toUpperCase();
    const normalizedSupplier = newSupplierName.trim();
    const parsedVal = parseFloat(newValue) || 0;

    let existingSupplier = suppliers.find(
      (s) => s.name.toLowerCase() === normalizedSupplier.toLowerCase()
    );

    let updatedSuppliers = [...suppliers];

    if (!existingSupplier) {
      const slug = normalizedSupplier.toLowerCase()
        .replace(/[^a-z0-9 ]/g, '')
        .replace(/\s+/g, '-');
      
      existingSupplier = {
        id: slug,
        name: normalizedSupplier,
        category: 'Tecnologia & Geral',
        contact: 'Representante Geral',
        email: 'vendas@' + slug + '.com.br'
      };

      updatedSuppliers = [...suppliers, existingSupplier];
      setSuppliers(updatedSuppliers);
    }

    const newRequest: PurchaseRequest = {
      id: cleanedId,
      supplierId: existingSupplier.id,
      description: newDescription.trim() || 'Aquisição de suprimentos de rotina',
      value: parsedVal,
      status: newStatus,
      date: new Date().toISOString().split('T')[0],
      branch: newBranch
    };

    setRequests((prev) => [...prev, newRequest]);

    // Switch focus instantly to the newly added supplier board to verify active routing
    setSelectedSupplierId(existingSupplier.id);

    // Dynamic banner response
    let msg = `Fluxo Ativo: ID ${cleanedId} roteado para "${existingSupplier.name}" em convênio com a ${newBranch}!`;
    if (showNewSupplierBadge) {
      msg = `Cadastro Automático: Criado workspace do fornecedor "${existingSupplier.name}" na ${newBranch}!`;
    }
    setSuccessMessage(msg);

    // Reset inputs
    setNewRequestId('');
    setNewSupplierName('');
    setNewDescription('');
    setNewValue('');
    setNewStatus('Pendente');
    setNewBranch(BRANCHES_EX[0]);
    setIsFocused(false);

    setTimeout(() => {
      setSuccessMessage(null);
    }, 6000);
  };

  const generateRandomId = () => {
    const num = Math.floor(100000 + Math.random() * 900000);
    setNewRequestId(`ID${num}`);
  };

  // Add Supplier manually from the bottom of the list
  const handleAddSupplierOnly = (name: string, category: string) => {
    const slug = name.trim().toLowerCase()
      .replace(/[^a-z0-9 ]/g, '')
      .replace(/\s+/g, '-');

    if (suppliers.some(s => s.id === slug)) return;

    const newSup: Supplier = {
      id: slug,
      name: name.trim(),
      category: category || 'Geral',
      contact: 'Atendimento',
      email: 'contato@' + slug + '.com.br'
    };

    setSuppliers(prev => [...prev, newSup]);
    setSelectedSupplierId(slug);
  };

  // Update status for an existing request
  const handleUpdateStatus = (requestId: string, newStatus: RequestStatus) => {
    setRequests((anyPrev) =>
      anyPrev.map((r) => (r.id === requestId ? { ...r, status: newStatus } : r))
    );
  };

  // Remove request
  const handleDeleteRequest = (requestId: string) => {
    if (window.confirm(`Tem certeza que deseja desvincular o ID de compra ${requestId}?`)) {
      setRequests((prev) => prev.filter((r) => r.id !== requestId));
    }
  };

  // Restore Default Seeds
  const handleResetDemoData = () => {
    if (window.confirm('Deseja restaurar as configurações originais com as pastas de Opção Informática e outros parceiros?')) {
      setSuppliers(INITIAL_SUPPLIERS);
      setRequests(INITIAL_REQUESTS);
      setSelectedSupplierId('global');
      localStorage.removeItem('sra_suppliers');
      localStorage.removeItem('sra_requests');
    }
  };

  // Map of suppliers filtered
  const filteredSuggestions = suppliers.filter((s) =>
    s.name.toLowerCase().includes(newSupplierName.toLowerCase())
  );

  // Compute stats and structures for Clean Minimalism
  const activeSupplier = useMemo(() => {
    return suppliers.find(s => s.id === selectedSupplierId) || null;
  }, [selectedSupplierId, suppliers]);

  const activeSupplierRequests = useMemo(() => {
    if (selectedSupplierId === 'global') return requests;
    return requests.filter(r => r.supplierId === selectedSupplierId);
  }, [selectedSupplierId, requests]);

  // Further filter active list by state search query, status choice, and branch option
  const mainWorkspaceRequests = useMemo(() => {
    return activeSupplierRequests.filter(req => {
      const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
      const matchesBranch = branchFilter === 'all' || req.branch === branchFilter;
      const matchesSearch = 
        req.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (req.branch && req.branch.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesStatus && matchesBranch && matchesSearch;
    });
  }, [activeSupplierRequests, statusFilter, branchFilter, searchQuery]);

  // Aggregate quantity counts per supplier to display directly on sidebar badges
  const supplierCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    requests.forEach(r => {
      counts[r.supplierId] = (counts[r.supplierId] || 0) + 1;
    });
    return counts;
  }, [requests]);

  const handleCopyIDs = () => {
    if (activeSupplierRequests.length === 0) return;
    const idsText = activeSupplierRequests.map(r => r.id).join(', ');
    navigator.clipboard.writeText(idsText);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2000);
  };

  // Quick total metrics
  const globalProcurementValue = useMemo(() => {
    return requests.reduce((sum, r) => sum + r.value, 0);
  }, [requests]);

  return (
    <div className="flex h-screen w-full bg-slate-50 font-sans text-slate-800 overflow-hidden">
      
      {/* Dynamic Slide-Over Sidebar Mobile */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar: Navigation & Group Folders */}
      <aside className={`
        fixed inset-y-0 left-0 w-72 bg-white border-r border-slate-200/80 z-50 flex flex-col transition-transform duration-300
        lg:static lg:translate-x-0
        ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Sidebar Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-1 px-2.5 bg-indigo-600 text-white rounded-lg text-xs font-black tracking-widest">SRA</span>
            <div>
              <h1 className="text-xs font-bold uppercase tracking-widest text-slate-900">Procurement Hub</h1>
              <span className="text-[10px] text-slate-400 block mt-0.5">Triagem de Suprimentos</span>
            </div>
          </div>
          <button 
            type="button" 
            onClick={() => setMobileSidebarOpen(false)}
            className="p-1.5 hover:bg-slate-50 rounded-lg lg:hidden text-slate-400 hover:text-slate-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin">
          <div className="space-y-1">
            <p className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Serviços Gerais</p>
            
            {/* Global dashboard link */}
            <button
              onClick={() => {
                setSelectedSupplierId('global');
                setMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-xs transition-all ${
                selectedSupplierId === 'global'
                  ? 'bg-indigo-50/80 text-indigo-700 font-bold'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <span className={`w-2 h-2 rounded-full ${selectedSupplierId === 'global' ? 'bg-indigo-600' : 'bg-slate-400'}`}></span>
                Portal de Auditoria Central
              </span>
              <span className="text-[10px] font-mono font-bold bg-slate-100 px-2 py-0.5 rounded-full text-slate-500">
                {requests.length}
              </span>
            </button>
          </div>

          <div className="space-y-1">
            <p className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pastas por Fornecedor</p>
            
            {suppliers.map((sup) => {
              const isActive = selectedSupplierId === sup.id;
              const count = supplierCounts[sup.id] || 0;
              return (
                <button
                  key={sup.id}
                  onClick={() => {
                    setSelectedSupplierId(sup.id);
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white font-semibold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-2.5 truncate max-w-[170px]">
                    <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-white' : 'bg-slate-300'}`}></span>
                    <span className="truncate" title={sup.name}>{sup.name}</span>
                  </span>
                  
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {count} ID{count !== 1 ? 's' : ''}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick Info Box in Sidebar */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              Roteamento Ativo
            </h4>
            <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
              Sempre que novos IDs de compra são adicionados no cabeçalho superior, eles são triados de forma lógica e encaminhados à gaveta individual.
            </p>
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-100 space-y-3">
          <div className="bg-slate-900 rounded-xl p-3.5 text-white flex items-center justify-between">
            <div>
              <p className="text-[9px] uppercase tracking-wider opacity-60">Sessão Ativa</p>
              <p className="text-xs font-semibold">Porto de Triagem</p>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={handleResetDemoData}
              className="text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-rose-600 flex items-center gap-1 transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              Resetar Banco
            </button>
            <span className="text-[10px] text-slate-400 font-mono font-bold">GMT-3</span>
          </div>
        </div>
      </aside>

      {/* Main Workspace Frame */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Dynamic Launch Top Header */}
        <header className="bg-white border-b border-slate-200 p-4 lg:p-6 shrink-0 z-30 shadow-2xs relative">
          <div className="flex items-center justify-between gap-4 lg:gap-8 flex-wrap lg:flex-nowrap">
            
            {/* Left Hamburger & Title info */}
            <div className="flex items-center gap-3 w-full lg:w-auto">
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(true)}
                className="lg:hidden p-2 bg-slate-50 hover:bg-slate-100 rounded-lg text-slate-500"
              >
                <Menu className="w-5 h-5" />
              </button>
              
              <div>
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest block lg:hidden">Procurement Hub</span>
                <h2 className="text-sm font-bold text-slate-900 tracking-tight">Roteador de Solicitações</h2>
              </div>
            </div>

            {/* QUICK LAUNCH ROUTER FORM - High Fidelity Minimal layout */}
            <form onSubmit={handleAddRequest} className="w-full flex-1 flex flex-col xl:flex-row items-stretch xl:items-end gap-3 max-w-[90rem]">
              
              {/* ID Input */}
              <div className="flex flex-col flex-1 min-w-[120px]">
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="top-id-input" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    ID da Solicitação
                  </label>
                  <button
                    type="button"
                    onClick={generateRandomId}
                    className="text-[9px] text-indigo-600 hover:underline font-bold"
                  >
                    Gerar
                  </button>
                </div>
                <input
                  id="top-id-input"
                  type="text"
                  required
                  placeholder="Ex: ID145978"
                  value={newRequestId}
                  onChange={(e) => setNewRequestId(e.target.value)}
                  className="text-xs font-mono font-bold w-full bg-slate-100/80 border border-slate-200/60 rounded-xl p-2.5 px-3 focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none placeholder:font-sans placeholder:font-normal placeholder:text-slate-400"
                />
              </div>

              {/* Supplier Input with Live Autocomplete dropdown */}
              <div className="flex flex-col flex-1 md:flex-2 xl:flex-3 min-w-[180px] relative" ref={dropdownRef}>
                <label htmlFor="top-supplier-input" className="text-[10px] font-bold text-slate-400 camelcase uppercase tracking-wider mb-1">
                  Nome do Fornecedor
                </label>
                <div className="relative">
                  <input
                    id="top-supplier-input"
                    type="text"
                    required
                    autoComplete="off"
                    placeholder="Ex: Opção Informática"
                    value={newSupplierName}
                    onFocus={() => setIsFocused(true)}
                    onChange={(e) => {
                      setNewSupplierName(e.target.value);
                      setIsFocused(true);
                    }}
                    className="text-xs font-semibold w-full bg-slate-100/80 border border-slate-200/60 rounded-xl p-2.5 px-3 pr-8 focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                  <div className="absolute right-2.5 top-2.5 text-slate-400">
                    <Search className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Suggestions Modal dropdown */}
                <AnimatePresence>
                  {isFocused && (
                    <motion.div
                      initial={{ opacity: 0, y: 3 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="absolute left-0 right-0 top-[42px] z-50 bg-white border border-slate-200 rounded-xl shadow-lg max-h-40 overflow-y-auto"
                    >
                      {filteredSuggestions.length > 0 ? (
                        <div className="p-1">
                          <p className="text-[9px] font-bold text-slate-400 px-2.5 py-1 uppercase bg-slate-50 rounded">Sugestões Existentes</p>
                          {filteredSuggestions.map((s) => (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => {
                                setNewSupplierName(s.name);
                                setIsFocused(false);
                              }}
                              className="w-full text-left px-2.5 py-2 text-xs hover:bg-slate-50 rounded-lg text-slate-800 font-medium flex justify-between items-center transition-colors"
                            >
                              <span>{s.name}</span>
                              <span className="text-[9px] text-slate-400 uppercase">{s.category || 'Suprimentos'}</span>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="p-3 text-center text-[10px] font-medium text-slate-400">
                          Novo parceiro virtual. Cadastraremos automaticamente!
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Branch (Filial) dropdown */}
              <div className="flex flex-col flex-1 min-w-[200px]">
                <label htmlFor="top-branch-input" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Store className="w-3.5 h-3.5 text-indigo-500" />
                  Filial Requisitante (34 Lojas)
                </label>
                <select
                  id="top-branch-input"
                  value={newBranch}
                  onChange={(e) => setNewBranch(e.target.value)}
                  className="text-xs font-semibold w-full bg-slate-100/80 border border-slate-200/60 rounded-xl p-2.5 px-3 focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none text-slate-700 cursor-pointer"
                >
                  {BRANCHES_EX.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              {/* Estimate value input */}
              <div className="flex flex-col w-28 shrink-0">
                <label htmlFor="top-value-input" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Valor Est. (R$)
                </label>
                <input
                  id="top-value-input"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0,00"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  className="text-xs font-semibold w-full bg-slate-100/80 border border-slate-200/60 rounded-xl p-2.5 px-3 focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {/* Short summary description */}
              <div className="flex flex-col flex-1 min-w-[150px]">
                <label htmlFor="top-description-input" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Finalidade / Demanda
                </label>
                <input
                  id="top-description-input"
                  type="text"
                  placeholder="Notebooks, Peças, Serviços..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="text-xs w-full bg-slate-100/80 border border-slate-200/60 rounded-xl p-2.5 px-3 focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {/* Action route button */}
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs p-2.5 px-5 rounded-xl transition duration-200 active:scale-95 shrink-0 flex items-center justify-center gap-2 shadow-xs cursor-pointer h-[38px] w-full sm:w-auto"
              >
                <span>Encaminhar</span>
                <PlusCircle className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          {/* New supplier fast notices inside the headers */}
          <AnimatePresence>
            {showNewSupplierBadge && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="overflow-hidden mt-3 max-w-6xl mx-auto"
              >
                <div className="p-2 px-3 bg-sky-50 border border-sky-100 rounded-xl text-sky-800 text-[10px] flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                  <span>
                    O Fornecedor <strong>"{newSupplierName}"</strong> será cadastrado no banco instantaneamente assim que você enviar esta demana.
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </header>

        {/* Workspace Central Panels */}
        <section className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-6 bg-slate-50">
          
          {/* Action Success Alerts overlay */}
          <AnimatePresence>
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-3.5 bg-emerald-50 border border-emerald-100/60 rounded-2xl text-emerald-800 text-xs flex items-center gap-3 shadow-2xs max-w-4xl"
              >
                <span className="p-1 bg-emerald-600 text-white rounded-lg">
                  <Check className="w-3.5 h-3.5" />
                </span>
                <span className="font-semibold">{successMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Header Title with Subtitle decoration */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2 className="text-xl lg:text-2xl font-bold text-slate-900 tracking-tight block">
                {selectedSupplierId === 'global' ? 'Painel Geral de Auditoria' : 'Painel de Fornecedor'}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {selectedSupplierId === 'global' ? (
                  <span>Visão centralizada de todas as triagens e andamento global das cotas de compras.</span>
                ) : (
                  <span>Demandas segregadas para: <span className="font-semibold text-slate-900 underline decoration-indigo-400 underline-offset-4">{activeSupplier?.name}</span></span>
                )}
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                {requests.filter(r => r.status === 'Concluído').length} Concluídos
              </span>
              <span className="bg-amber-50 border border-amber-100 text-amber-700 text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                {requests.filter(r => r.status !== 'Concluído').length} Ativos / Em Cotação
              </span>
            </div>
          </div>

          {/* Global statistics / Visual lists cards */}
          {selectedSupplierId === 'global' ? (
            <div className="space-y-6">
              
              {/* KPIs indicators card groups */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Total registered requisitions */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-xs flex items-center gap-4">
                  <div className="p-3 bg-slate-900 text-white rounded-xl">
                    <Layers className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Demanda Total</p>
                    <h3 className="text-xl font-bold font-mono text-slate-800">{requests.length} Identificadores</h3>
                  </div>
                </div>

                {/* Total procurement value */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-xs flex items-center gap-4">
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Volume de Negociação</p>
                    <h3 className="text-xl font-bold font-mono text-slate-800">
                      R$ {globalProcurementValue.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </h3>
                  </div>
                </div>

                {/* Supplier counts */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-xs flex items-center gap-4">
                  <div className="p-3 bg-sky-50 text-sky-600 rounded-xl">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Fornecedores Registrados</p>
                    <h3 className="text-xl font-bold font-mono text-slate-800">{suppliers.length} Parceiros</h3>
                  </div>
                </div>

                {/* Average transaction count */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-xs flex items-center gap-4">
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Ticket Médio Estimado</p>
                    <h3 className="text-sm font-bold text-slate-800 font-mono">
                      R$ {(requests.length > 0 ? (globalProcurementValue / requests.length) : 0).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Dynamic folder mapping visualization */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Active Isolated Drawer summary */}
                <div className="bg-white col-span-1 lg:col-span-7 p-6 rounded-2xl border border-slate-200/60 shadow-sm space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <FolderSync className="w-4 h-4 text-slate-400" />
                        Distribuição das Pastas ERP
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">Armazenamento setorizado autônomo baseado no emissor da proposta.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                    {suppliers.map((sup) => {
                      const related = requests.filter(r => r.supplierId === sup.id);
                      const valueSum = related.reduce((acc, cr) => acc + cr.value, 0);

                      return (
                        <div 
                          key={sup.id} 
                          onClick={() => setSelectedSupplierId(sup.id)}
                          className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-100/80 transition-all cursor-pointer group"
                        >
                          <div className="flex justify-between items-start">
                            <span className="text-[8px] bg-white border border-slate-200 text-slate-400 font-extrabold px-1.5 py-0.5 rounded tracking-wider uppercase">
                              📁 Gaveta Ativa
                            </span>
                            <span className="font-mono text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                              {related.length} IDs
                            </span>
                          </div>

                          <h4 className="text-xs font-bold text-slate-800 mt-2.5 truncate">{sup.name}</h4>
                          <span className="text-[10px] text-slate-400 italic block mt-0.5">{sup.category || 'Suprimentos'}</span>

                          <div className="pt-2.5 mt-2 border-t border-slate-200/45 flex justify-between items-center text-[10px] text-slate-500">
                            <span>Soma Proposta:</span>
                            <strong className="text-slate-800 font-mono">
                              R$ {valueSum.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                            </strong>
                          </div>
                        </div>
                      );
                    })}

                    {/* Inline Manual Add Supplier Option */}
                    <div className="p-3 border border-dashed border-slate-300 rounded-xl flex flex-col justify-center items-center text-center bg-slate-50/20">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Novo Fornecedor Manual</p>
                      <button
                        onClick={() => {
                          const name = prompt('Insira o nome do novo fornecedor (ex: Delta Office):');
                          if (name && name.trim()) {
                            handleAddSupplierOnly(name, 'Suprimentos Gerais');
                          }
                        }}
                        className="text-[10px] font-bold bg-slate-900 text-white rounded-lg px-3 py-1.5 mt-2 hover:bg-slate-800 transition"
                      >
                        Cadastrar Agora
                      </button>
                    </div>
                  </div>
                </div>

                {/* Audit pipeline tracker logs */}
                <div className="bg-white col-span-1 lg:col-span-5 p-6 rounded-2xl border border-slate-200/60 shadow-sm space-y-4 flex flex-col">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Layers2 className="w-4 h-4 text-slate-400" />
                      Linha de Auditoria ao Vivo
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">Veja onde cada novo ID inserido foi depositado.</p>
                  </div>

                  <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[300px] pr-1">
                    {[...requests].reverse().slice(0, 6).map((req) => {
                      const sup = suppliers.find(s => s.id === req.supplierId);
                      return (
                        <div 
                          key={req.id} 
                          className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between transition hover:border-slate-300"
                        >
                          <div className="space-y-1 block truncate">
                            <span className="font-mono text-[10px] font-extrabold bg-slate-900 text-white px-2 py-0.5 rounded-md">
                              {req.id}
                            </span>
                            <p className="text-[10px] text-slate-400 italic font-medium truncate max-w-[130px]" title={req.description}>
                              {req.description}
                            </p>
                          </div>

                          <div className="flex flex-col items-center">
                            <span className="text-[8px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded uppercase">Roteador</span>
                            <span className="text-[8px] text-slate-500 font-medium">Auto-Inbox</span>
                          </div>

                          <div className="text-right truncate max-w-[120px]">
                            <p className="font-bold text-slate-800 text-[10px] truncate" title={sup?.name}>{sup?.name}</p>
                            <span className="text-[9px] text-slate-400 font-mono">R$ {req.value.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</span>
                          </div>
                        </div>
                      );
                    })}

                    {requests.length === 0 && (
                      <div className="text-center p-8 text-slate-400 text-xs italic">
                        Nenhum ID de solicitação lançado ainda.
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          ) : (
            
            // INDIVIDUAL ACTIVE SUPPLIER DESK Drawer Desk
            <div className="space-y-6">
              
              {/* Selected supplier info card details */}
              <div className="bg-slate-900 text-white p-6 rounded-2xl relative overflow-hidden shadow-xs">
                <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl" />
                
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <span className="text-[9px] bg-slate-800 border border-slate-700/60 text-slate-300 font-extrabold tracking-widest px-2.5 py-1 rounded-full uppercase">
                      🏢 Gaveta de IDs Separada
                    </span>
                    <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white mt-2.5">
                      {activeSupplier?.name}
                    </h1>

                    <div className="flex flex-wrap gap-x-5 gap-y-1.5 mt-3.5 text-slate-400 text-[11px]">
                      <span className="flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-slate-500" />
                        Setor: <strong className="text-slate-200">{activeSupplier?.category || 'Geral'}</strong>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-500" />
                        Atendimento: <strong className="text-slate-200">{activeSupplier?.contact}</strong>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-500" />
                        E-mail de compras: <strong className="text-slate-200">{activeSupplier?.email}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Actions specific to supplier drawer */}
                  <div className="shrink-0 flex items-center gap-2 w-full md:w-auto">
                    <button
                      type="button"
                      disabled={activeSupplierRequests.length === 0}
                      onClick={handleCopyIDs}
                      className="w-full md:w-auto bg-white hover:bg-slate-100 disabled:bg-slate-800 disabled:text-slate-600 text-slate-900 font-bold text-xs p-2.5 px-4 rounded-xl transition duration-200 flex items-center justify-center gap-2"
                    >
                      {copiedNotification ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Copiados!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-500" />
                          <span>Copiar Lista de IDs</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* mini aggregated indicators specific to supplier */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800">
                  <div className="bg-slate-800/40 p-3 rounded-xl">
                    <p className="text-[10px] text-slate-400 uppercase font-medium">IDs Depositados</p>
                    <span className="text-lg font-bold font-mono mt-0.5 block">{activeSupplierRequests.length}</span>
                  </div>

                  <div className="bg-slate-800/40 p-3 rounded-xl">
                    <p className="text-[10px] text-slate-400 uppercase font-medium">Custo Estimado</p>
                    <span className="text-lg font-bold font-mono text-emerald-400 mt-0.5 block">
                      R$ {activeSupplierRequests.reduce((a,c) => a + c.value, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="bg-slate-800/40 p-3 rounded-xl">
                    <p className="text-[10px] text-slate-400 uppercase font-medium">Em Andamento</p>
                    <span className="text-lg font-bold font-mono text-amber-500 mt-0.5 block">
                      {activeSupplierRequests.filter(r => r.status !== 'Concluído').length}
                    </span>
                  </div>

                  <div className="bg-slate-800/40 p-3 rounded-xl">
                    <p className="text-[10px] text-slate-400 uppercase font-medium">Pedidos Faturados</p>
                    <span className="text-lg font-bold font-mono text-sky-400 mt-0.5 block">
                      {activeSupplierRequests.filter(r => r.status === 'Concluído').length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Data Table */}
              <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
                <div className="p-4 lg:p-5 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Organização de Demandas Vinculadas</h3>
                    <p className="text-[11px] text-slate-400 mt-1">
                      As solicitações abaixo estão direcionadas sob custódia seletiva deste parceiro comercial.
                    </p>
                  </div>

                  {/* search and filter tools */}
                  <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
                    <div className="relative flex-1 md:flex-initial">
                      <span className="absolute left-3 top-2.5 text-slate-400">
                        <Search className="w-3.5 h-3.5" />
                      </span>
                      <input
                        type="text"
                        placeholder="Buscar ID ou descrição..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="text-xs bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-2 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 w-full"
                      />
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <Filter className="w-3.5 h-3.5 text-slate-400" />
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-slate-700 font-semibold"
                      >
                        <option value="all">Sits: Todos</option>
                        <option value="Pendente">⏱️ Pendente</option>
                        <option value="Em Cotação">🔍 Em Cotação</option>
                        <option value="Enviado">📨 Enviado</option>
                        <option value="Concluído">✅ Concluído</option>
                        <option value="Cancelado">❌ Cancelado</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <Store className="w-3.5 h-3.5 text-slate-400" />
                      <select
                        value={branchFilter}
                        onChange={(e) => setBranchFilter(e.target.value)}
                        className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-slate-700 font-semibold max-w-[150px] md:max-w-xs cursor-pointer"
                        title="Filtrar por Filial"
                      >
                        <option value="all">Filial: Todas (34)</option>
                        {BRANCHES_EX.map((b) => (
                          <option key={b} value={b}>
                            {b}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* List Table items */}
                {mainWorkspaceRequests.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {/* Header Columns */}
                    <div className="hidden md:grid grid-cols-12 bg-slate-50/50 p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                      <div className="col-span-2">ID Solicitação</div>
                      <div className="col-span-3">Descrição / Finalidade</div>
                      <div className="col-span-3">Filial</div>
                      <div className="col-span-2">Data Entrada</div>
                      <div className="col-span-1 text-right">Valor Est.</div>
                      <div className="col-span-1 text-right">Ações</div>
                    </div>

                    {mainWorkspaceRequests.map((req) => (
                      <div 
                        key={req.id} 
                        className="p-4 grid grid-cols-1 md:grid-cols-12 items-start md:items-center gap-3 hover:bg-slate-50/70 transition-colors"
                      >
                        
                        {/* ID Tag */}
                        <div className="col-span-1 md:col-span-2 flex items-center md:block gap-2">
                          <span className="font-mono text-xs font-black bg-slate-900 text-white px-2.5 py-1 rounded-xl select-all shadow-2xs">
                            {req.id}
                          </span>
                          
                          {/* status inside id column for mobile */}
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full md:hidden ${
                            req.status === 'Concluído' ? 'bg-sky-50 text-sky-700' :
                            req.status === 'Pendente' ? 'bg-amber-50 text-amber-700' :
                            req.status === 'Em Cotação' ? 'bg-indigo-50 text-indigo-700' :
                            'bg-slate-100 text-slate-600'
                          }`}>
                            {req.status}
                          </span>
                        </div>

                        {/* description column */}
                        <div className="col-span-1 md:col-span-3 space-y-0.5">
                          <p className="text-xs font-semibold text-slate-800">{req.description}</p>
                          <span className="text-[10px] text-slate-400 block font-medium">Destino de envio: {activeSupplier?.name}</span>
                        </div>

                        {/* branch/filial column */}
                        <div className="col-span-1 md:col-span-3 text-slate-600 text-xs flex items-center gap-1.5 font-semibold">
                          <Store className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          <span className="truncate" title={req.branch}>
                            {req.branch || 'Filial 01'}
                          </span>
                        </div>

                        {/* Date column */}
                        <div className="col-span-1 md:col-span-2 text-slate-500 font-mono text-[11px] flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {req.date}
                        </div>

                        {/* Value column */}
                        <div className="col-span-1 md:col-span-1 md:text-right font-mono font-bold text-xs text-slate-700">
                          R$ {req.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>

                        {/* Actions column */}
                        <div className="col-span-1 md:col-span-1 flex items-center justify-between md:justify-end gap-2 mt-2 md:mt-0 pt-2 md:pt-0 border-t border-slate-100 md:border-none">
                          <select
                            title="Mudar status deste ID"
                            value={req.status}
                            onChange={(e) => handleUpdateStatus(req.id, e.target.value as RequestStatus)}
                            className="text-[11px] font-bold text-slate-700 bg-white border border-slate-200 rounded-lg p-1 px-2 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                          >
                            <option value="Pendente">⏱️ Pendente</option>
                            <option value="Em Cotação">🔍 Em Cotação</option>
                            <option value="Enviado">📨 Enviado</option>
                            <option value="Concluído">✅ Concluído</option>
                            <option value="Cancelado">❌ Cancelado</option>
                          </select>

                          <button
                            type="button"
                            onClick={() => handleDeleteRequest(req.id)}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-lg transition"
                            title="Remover ID desta gaveta"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 text-center text-slate-400 text-xs italic">
                    Nenhuma solicitação direcionada a este fornecedor corresponde aos filtros de busca.
                  </div>
                )}

                {/* Ledger integrated copy helper under the list table */}
                {activeSupplierRequests.length > 0 && (
                  <div className="bg-slate-50/50 p-4 border-t border-slate-150 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                    <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                      <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                      <span>Integração ERP: Cópia rápida de todos os IDs</span>
                    </div>

                    <div className="bg-white border border-slate-200 text-xs font-mono font-bold text-slate-700 p-2 rounded-lg max-w-sm overflow-x-auto whitespace-nowrap tracking-wide select-all shadow-3xs cursor-pointer">
                      {activeSupplierRequests.map(r => r.id).join(', ')}
                    </div>
                  </div>
                )}
              </div>
            </div>

          )}

          {/* Centralized footer instruction guideline */}
          <footer className="pt-8 border-t border-slate-200/85 flex flex-col sm:flex-row justify-between items-center text-[10px] text-slate-400 font-mono tracking-widest uppercase gap-3">
            <p className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
              SRA - Roteamento Autônomo e Triagem de Notas v2.60
            </p>
            <p>Organizando demandas em tempo real</p>
          </footer>
        </section>

      </main>
    </div>
  );
}
