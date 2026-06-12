import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  Copy, 
  Check, 
  Trash2, 
  Briefcase, 
  TrendingUp, 
  Mail, 
  Calendar, 
  User, 
  FileSpreadsheet, 
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ChevronRight,
  Plus
} from 'lucide-react';
import { Supplier, PurchaseRequest, RequestStatus } from '../types';

interface SupplierBoardsProps {
  suppliers: Supplier[];
  requests: PurchaseRequest[];
  onUpdateStatus: (requestId: string, newStatus: RequestStatus) => void;
  onDeleteRequest: (requestId: string) => void;
  onAddSupplierOnly: (name: string, category: string, contact: string, email: string) => void;
}

export default function SupplierBoards({ 
  suppliers, 
  requests, 
  onUpdateStatus, 
  onDeleteRequest,
  onAddSupplierOnly
}: SupplierBoardsProps) {
  // Active supplier selected in the dashboard
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>(
    suppliers[0]?.id || ''
  );

  // Supplier Creation Modal/Inline state
  const [isAddingSupplier, setIsAddingSupplier] = useState(false);
  const [newSupName, setNewSupName] = useState('');
  const [newSupCategory, setNewSupCategory] = useState('');
  const [newSupContact, setNewSupContact] = useState('');
  const [newSupEmail, setNewSupEmail] = useState('');
  const [supplierError, setSupplierError] = useState('');

  // Status Filter state
  const [statusFilter, setStatusFilter] = useState<string>('all');
  // Search query within the selected supplier's requests
  const [searchQuery, setSearchQuery] = useState('');

  // UI action states
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Safely find selected supplier, fallback to first if missing
  const currentSupplier = useMemo(() => {
    const found = suppliers.find(s => s.id === selectedSupplierId);
    return found || suppliers[0];
  }, [selectedSupplierId, suppliers]);

  // Keep dropdown/selection in fallback sync
  if (currentSupplier && currentSupplier.id !== selectedSupplierId) {
    setSelectedSupplierId(currentSupplier.id);
  }

  // Filter requests routed strictly to this supplier (and search query, status filtered)
  const currentSupplierRequests = useMemo(() => {
    if (!currentSupplier) return [];
    return requests.filter(req => req.supplierId === currentSupplier.id);
  }, [currentSupplier, requests]);

  const filteredRequests = useMemo(() => {
    return currentSupplierRequests.filter(req => {
      const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
      const matchesSearch = 
        req.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [currentSupplierRequests, statusFilter, searchQuery]);

  // Supplier-specific KPIs
  const kpis = useMemo(() => {
    const totalCount = currentSupplierRequests.length;
    const completedCount = currentSupplierRequests.filter(r => r.status === 'Concluído').length;
    const pendingCount = currentSupplierRequests.filter(r => r.status === 'Pendente').length;
    const totalValue = currentSupplierRequests.reduce((acc, curr) => acc + curr.value, 0);
    
    return {
      totalCount,
      completedCount,
      pendingCount,
      totalValue
    };
  }, [currentSupplierRequests]);

  // Copy only IDs to clipboard (e.g. "ID145978, ID193855")
  const handleCopyIDs = () => {
    if (currentSupplierRequests.length === 0) return;
    const idsList = currentSupplierRequests.map(r => r.id).join(', ');
    navigator.clipboard.writeText(idsList);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2500);
  };

  // Add Supplier Flow
  const handleCreateSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    setSupplierError('');
    
    if (!newSupName.trim()) {
      setSupplierError('Nome do fornecedor é obrigatório.');
      return;
    }

    const dup = suppliers.some(s => s.name.toLowerCase() === newSupName.trim().toLowerCase());
    if (dup) {
      setSupplierError('Já existe um fornecedor com este nome.');
      return;
    }

    onAddSupplierOnly(
      newSupName.trim(),
      newSupCategory.trim() || 'Geral',
      newSupContact.trim() || 'Não Informado',
      newSupEmail.trim() || 'contato@fornecedor.com.br'
    );

    // Dynamic select the newly created supplier
    const slug = newSupName.trim().toLowerCase()
      .replace(/[^a-z0-9 ]/g, '')
      .replace(/\s+/g, '-');
    
    setSelectedSupplierId(slug);
    
    // reset form
    setNewSupName('');
    setNewSupCategory('');
    setNewSupContact('');
    setNewSupEmail('');
    setIsAddingSupplier(false);
  };

  return (
    <div id="supplier-boards-wrapper" className="space-y-6">
      
      {/* Supplier Selection Rail & Controls */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex-1 w-full">
            <label htmlFor="supplier-select" className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
              Selecione o Fornecedor Cadastrado
            </label>
            <div className="flex items-center gap-2">
              <select
                id="supplier-select"
                value={selectedSupplierId}
                onChange={(e) => setSelectedSupplierId(e.target.value)}
                className="font-semibold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-slate-900 focus:outline-none focus:bg-white transition-shadow grow max-w-sm"
              >
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    📦 {s.name}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => setIsAddingSupplier(!isAddingSupplier)}
                className="bg-slate-50 border border-slate-200 hover:border-slate-400 text-slate-700 hover:text-slate-900 p-2.5 rounded-xl transition-all font-medium text-xs flex items-center gap-1.5 shrink-0"
                title="Cadastrar Fornecedor Manualmente"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden md:inline">Fornecedor</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 text-right shrink-0">
            <span className="text-xs text-slate-500 font-mono">
              Total: <strong>{suppliers.length}</strong> fornecedores cadastrados
            </span>
          </div>
        </div>

        {/* Inline Create Supplier Form */}
        <AnimatePresence>
          {isAddingSupplier && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mt-4"
            >
              <form onSubmit={handleCreateSupplier} className="p-5 border border-slate-100 bg-slate-50 rounded-xl space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <h3 className="text-xs font-semibold uppercase text-slate-700">Novo Cadastro Rápido</h3>
                  <button 
                    type="button" 
                    onClick={() => setIsAddingSupplier(false)}
                    className="text-xs font-bold text-slate-400 hover:text-slate-600"
                  >
                    Fechar
                  </button>
                </div>

                {supplierError && (
                  <p className="text-xs font-medium text-rose-600">{supplierError}</p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 block mb-1">
                      Fornecedor *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Opção Informatica"
                      value={newSupName}
                      onChange={(e) => setNewSupName(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-white rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 block mb-1">
                      Categoria / Setor
                    </label>
                    <input
                      type="text"
                      placeholder="Tecnologia"
                      value={newSupCategory}
                      onChange={(e) => setNewSupCategory(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-white rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 block mb-1">
                      Contato Comercial
                    </label>
                    <input
                      type="text"
                      placeholder="Nome do representante"
                      value={newSupContact}
                      onChange={(e) => setNewSupContact(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-white rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 block mb-1">
                      E-mail de Pedidos
                    </label>
                    <input
                      type="email"
                      placeholder="compras@forn.com"
                      value={newSupEmail}
                      onChange={(e) => setNewSupEmail(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-white rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-slate-950 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition"
                  >
                    Salvar Fornecedor
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {currentSupplier ? (
        <div className="space-y-6">
          {/* Supplier Header Box / Card details */}
          <div className="bg-slate-900 text-white p-6 rounded-2xl relative overflow-hidden shadow-xs">
            <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-48 h-48 bg-slate-800/40 rounded-full blur-2xl" />
            
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <span className="text-[10px] bg-slate-800 border border-slate-700/60 text-slate-300 font-bold tracking-widest px-2.5 py-1 rounded-full uppercase">
                  🏢 Painel Isolado do Parceiro
                </span>
                <h1 className="text-2xl md:text-3xl font-sans font-bold text-white tracking-tight mt-2">
                  {currentSupplier.name}
                </h1>
                
                <div className="flex flex-wrap gap-x-5 gap-y-1.5 mt-3 text-slate-400 text-xs">
                  <span className="flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-slate-500" />
                    Setor: <strong className="text-slate-200">{currentSupplier.category || 'Suprimentos'}</strong>
                  </span>
                  {currentSupplier.contact && (
                    <span className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-500" />
                      Contato: <strong className="text-slate-200">{currentSupplier.contact}</strong>
                    </span>
                  )}
                  {currentSupplier.email && (
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-500" />
                      Email: <strong className="text-slate-200">{currentSupplier.email}</strong>
                    </span>
                  )}
                </div>
              </div>

              {/* Unique copy IDs and quick action */}
              <div className="shrink-0">
                <button
                  type="button"
                  disabled={currentSupplierRequests.length === 0}
                  onClick={handleCopyIDs}
                  className="bg-white hover:bg-slate-100 text-slate-900 disabled:bg-slate-800 disabled:text-slate-500 font-semibold text-xs px-4 py-2.5 rounded-xl transition duration-200 active:scale-95 flex items-center gap-2"
                >
                  {copiedNotification ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>IDs Copiados!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copiar Todos os IDs</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Supplier Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800">
              <div className="bg-slate-800/40 p-3 rounded-xl">
                <p className="text-[10px] text-slate-400 uppercase font-medium tracking-wide">Pedidos Vinculados</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-bold font-mono">{kpis.totalCount}</span>
                  <span className="text-xs text-slate-500">unidades</span>
                </div>
              </div>

              <div className="bg-slate-800/40 p-3 rounded-xl">
                <p className="text-[10px] text-slate-400 uppercase font-medium tracking-wide">Valor Acumulado</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-bold font-mono text-emerald-400">
                    R$ {kpis.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="bg-slate-800/40 p-3 rounded-xl">
                <p className="text-[10px] text-slate-400 uppercase font-medium tracking-wide">Pendentes / Em Cotação</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-bold font-mono text-yellow-400">{kpis.pendingCount}</span>
                  <span className="text-xs text-slate-500">atendimentos</span>
                </div>
              </div>

              <div className="bg-slate-800/40 p-3 rounded-xl">
                <p className="text-[10px] text-slate-400 uppercase font-medium tracking-wide">Concluídos</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-bold font-mono text-sky-400">{kpis.completedCount}</span>
                  <span className="text-xs text-slate-500">finalizados</span>
                </div>
              </div>
            </div>
          </div>

          {/* Supplier IDs Drawer Section */}
          <div className="bg-white border border-slate-100 rounded-2xl shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="font-semibold text-slate-900 text-sm">Gaveta Exclusiva de IDs de Compra</h2>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Mostrando os IDs roteados especificamente para <span className="font-semibold">{currentSupplier.name}</span>
                </p>
              </div>

              {/* Filter tools */}
              <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
                <div className="relative flex-1 md:flex-initial">
                  <span className="absolute left-3 top-2.5 text-slate-400">
                    <Search className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="text"
                    placeholder="Filtrar por ID ou resumo"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="text-xs bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-2 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 w-full"
                  />
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-slate-700"
                  >
                    <option value="all">Filtro: Todos</option>
                    <option value="Pendente">⏱️ Pendente</option>
                    <option value="Em Cotação">🔍 Em Cotação</option>
                    <option value="Enviado">📨 Enviado</option>
                    <option value="Concluído">✅ Concluído</option>
                    <option value="Cancelado">❌ Cancelado</option>
                  </select>
                </div>
              </div>
            </div>

            {/* List / Table */}
            {filteredRequests.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {filteredRequests.map((req) => (
                  <div key={req.id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-50 transition-colors">
                    <div className="space-y-1 block">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* ID Styled as premium tag */}
                        <span className="font-mono text-sm font-bold bg-slate-900 text-white px-2.5 py-0.5 rounded-lg select-all shadow-xs inline-flex items-center gap-1" title="Clique duas vezes para copiar">
                          {req.id}
                        </span>
                        
                        <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {req.date}
                        </span>

                        {/* Status chip */}
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          req.status === 'Concluído' ? 'bg-sky-50 text-sky-700 border border-sky-100' :
                          req.status === 'Pendente' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                          req.status === 'Em Cotação' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' :
                          req.status === 'Enviado' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                          'bg-rose-50 text-rose-700 border border-rose-100'
                        }`}>
                          {req.status}
                        </span>
                      </div>

                      <p className="text-xs text-slate-700 font-medium">{req.description}</p>
                      
                      <p className="text-[11px] text-slate-500 font-sans">
                        Estimativa: <strong className="text-slate-800">R$ {req.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                      </p>
                    </div>

                    {/* Manage actions inside the drawer */}
                    <div className="flex items-center gap-2.5 self-end sm:self-center">
                      <select
                        title="Modificar status da solicitação"
                        value={req.status}
                        onChange={(e) => onUpdateStatus(req.id, e.target.value as RequestStatus)}
                        className="text-[11px] bg-white border border-slate-200 hover:border-slate-350 rounded-lg px-2 py-1 focus:outline-none"
                      >
                        <option value="Pendente">⏱️ Pendente</option>
                        <option value="Em Cotação">🔍 Em Cotação</option>
                        <option value="Enviado">📨 Enviado</option>
                        <option value="Concluído">✅ Concluído</option>
                        <option value="Cancelado">❌ Cancelado</option>
                      </select>

                      <button
                        type="button"
                        onClick={() => onDeleteRequest(req.id)}
                        className="p-1 px-2 text-rose-500 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-lg transition"
                        title="Remover ID desta pasta"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50/50">
                <p className="text-xs font-semibold text-slate-400">
                  Nenhum ID correspondente encontrado nesta gaveta.
                </p>
                {currentSupplierRequests.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setStatusFilter('all');
                      setSearchQuery('');
                    }}
                    className="text-xs text-slate-900 font-bold underline mt-2"
                  >
                    Resetar Filtros
                  </button>
                )}
              </div>
            )}

            {/* Quick Copy Board Ledger helper */}
            {currentSupplierRequests.length > 0 && (
              <div className="p-4 bg-slate-50/60 border-t border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>Cópia integrada: use para alimentar planilhas ERP de forma instantânea.</span>
                </div>
                
                <div className="text-xs text-slate-700 bg-white border border-slate-200 rounded-lg p-2 max-w-md overflow-x-auto whitespace-nowrap scrollbar-thin select-all font-mono">
                  {currentSupplierRequests.map(r => r.id).join(', ')}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center p-12 bg-white rounded-2xl border border-slate-150 shadow-xs">
          <p className="text-slate-500 text-sm">Carregando painéis de fornecedores...</p>
        </div>
      )}
    </div>
  );
}
