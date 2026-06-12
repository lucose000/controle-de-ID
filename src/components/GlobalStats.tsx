import { useMemo } from 'react';
import { Supplier, PurchaseRequest } from '../types';
import { 
  Network, 
  Layers, 
  BarChart3, 
  FolderSync, 
  ArrowRight, 
  Flame, 
  CircleDollarSign,
  Briefcase
} from 'lucide-react';

interface GlobalStatsProps {
  suppliers: Supplier[];
  requests: PurchaseRequest[];
}

export default function GlobalStats({ suppliers, requests }: GlobalStatsProps) {
  
  // Calculate Global metrics 
  const stats = useMemo(() => {
    const totalRequests = requests.length;
    const totalValue = requests.reduce((acc, r) => acc + r.value, 0);
    const uniqueActiveSuppliers = new Set(requests.map(r => r.supplierId)).size;
    
    // Most loaded supplier
    const countMap: Record<string, number> = {};
    requests.forEach(r => {
      countMap[r.supplierId] = (countMap[r.supplierId] || 0) + 1;
    });

    let topSupplierId = '';
    let maxCount = 0;
    Object.entries(countMap).forEach(([id, count]) => {
      if (count > maxCount) {
        maxCount = count;
        topSupplierId = id;
      }
    });

    const topSupplierName = suppliers.find(s => s.id === topSupplierId)?.name || 'Nenhum';

    return {
      totalRequests,
      totalValue,
      uniqueActiveSuppliers,
      topSupplierName,
      topSupplierCount: maxCount
    };
  }, [suppliers, requests]);

  // Aggregate IDs count per supplier
  const supplierAggregations = useMemo(() => {
    return suppliers.map(supplier => {
      const relatedRequests = requests.filter(r => r.supplierId === supplier.id);
      const totalVal = relatedRequests.reduce((acc, curr) => acc + curr.value, 0);
      const idsList = relatedRequests.map(r => r.id);
      
      return {
        ...supplier,
        count: relatedRequests.length,
        totalVal,
        idsList
      };
    }).sort((a,b) => b.count - a.count);
  }, [suppliers, requests]);

  // Live Audit trace logic showing recent routing activities
  const recentRoutings = useMemo(() => {
    return [...requests].slice(-5).reverse();
  }, [requests]);

  return (
    <div id="global-stats-container" className="space-y-6">
      
      {/* Top Level Global Counters Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total demands */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-slate-900 text-white rounded-xl">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Lançamentos Globais</p>
            <h3 className="text-xl font-bold font-mono text-slate-800">{stats.totalRequests} IDs</h3>
          </div>
        </div>

        {/* Total procurement value */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <CircleDollarSign className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Volume Financeiro</p>
            <h3 className="text-xl font-bold font-mono text-slate-800">
              R$ {stats.totalValue.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
            </h3>
          </div>
        </div>

        {/* Active Suppliers with assignments */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Fornecedores Ativos</p>
            <h3 className="text-xl font-bold font-mono text-slate-800">{stats.uniqueActiveSuppliers} no fluxo</h3>
          </div>
        </div>

        {/* Most demanding supplier */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Maior Demanda</p>
            <h3 className="text-sm font-bold truncate max-w-[140px] text-slate-800" title={stats.topSupplierName}>
              {stats.topSupplierName}
            </h3>
            <span className="text-[10px] text-slate-500 font-medium">({stats.topSupplierCount} IDs roteados)</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Folders and ID Count visualization representing isolated sectors */}
        <div className="bg-white col-span-1 lg:col-span-7 rounded-2xl border border-slate-100 shadow-xs p-6 space-y-4">
          <div>
            <h2 className="font-sans font-bold text-slate-900 text-sm flex items-center gap-2">
              <FolderSync className="w-4 h-4 text-slate-600" />
              Sectores de Destino de IDs
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Cada fornecedor conta com uma pasta isolada contendo estritamente os seus identificadores.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {supplierAggregations.map(sup => (
              <div 
                key={sup.id} 
                className="p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100/50 transition-colors duration-200"
              >
                <div className="flex justify-between items-start gap-1">
                  <div className="truncate">
                    <span className="text-[9px] uppercase tracking-wider bg-white border border-slate-200/60 font-semibold px-2 py-0.5 rounded text-slate-500">
                      📂 Gaveta de IDs
                    </span>
                    <h4 className="font-bold text-slate-800 text-sm mt-1.5 truncate">
                      {sup.name}
                    </h4>
                  </div>
                  
                  <span className="text-xs font-mono font-bold bg-slate-900 text-white px-2.5 py-1 rounded-lg">
                    {sup.count}
                  </span>
                </div>

                {/* mini layout list of IDs in this supplier board block */}
                <div className="mt-4 space-y-1.5">
                  <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">IDs Roteados:</p>
                  
                  {sup.idsList.length > 0 ? (
                    <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto pt-1">
                      {sup.idsList.map(id => (
                        <span 
                          key={id} 
                          className="font-mono text-[10px] font-semibold bg-white border border-slate-200 text-slate-700 px-1.5 py-0.5 rounded shadow-2xs"
                        >
                          {id}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[10px] text-slate-400 italic font-medium block">Nenhuma solicitação pendente</span>
                  )}
                </div>

                <div className="mt-3 pt-3 border-t border-slate-200/50 flex justify-between text-[10px] text-slate-500">
                  <span>Financeiro Estimado</span>
                  <strong className="text-slate-800">
                    R$ {sup.totalVal.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                  </strong>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Automatic Routing Pipeline Feed */}
        <div className="bg-white col-span-1 lg:col-span-5 rounded-2xl border border-slate-100 shadow-xs p-6 space-y-4">
          <div>
            <h2 className="font-sans font-bold text-slate-900 text-sm flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-slate-600" />
              Auditoria de Fluxo Continuo
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Visualização instantânea de como as solicitações são organizadas.
            </p>
          </div>

          <div className="space-y-3">
            {recentRoutings.map((req, idx) => {
              const matchedSupName = suppliers.find(s => s.id === req.supplierId)?.name || 'Fornecedor';
              return (
                <div 
                  key={req.id + idx} 
                  className="p-3 bg-linear-to-r from-slate-50 to-white hover:from-white hover:to-slate-50 border border-slate-100 rounded-xl flex items-center justify-between text-xs transition-shadow shadow-2xs"
                >
                  <div className="space-y-0.5">
                    <span className="font-mono font-bold bg-slate-900 text-white px-2 py-0.5 rounded-md text-[10px]">
                      {req.id}
                    </span>
                    <p className="text-[10px] text-slate-500 italic mt-1 font-medium truncate max-w-[120px]">{req.description}</p>
                  </div>
                  
                  {/* Dynamic Pipeline vector arrow */}
                  <div className="flex flex-col items-center px-2">
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[9px] font-bold text-emerald-600 tracking-wider font-mono">ROTEADO</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 mt-0.5" />
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-slate-800 text-[11px] truncate max-w-[110px]">{matchedSupName}</p>
                    <span className="text-[10px] text-slate-400 font-mono block">R$ {req.value.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</span>
                  </div>
                </div>
              );
            })}

            {recentRoutings.length === 0 && (
              <div className="text-center p-8 text-slate-400 text-xs italic">
                Nenhum ID lançado no sistema ainda. Utilize o Portal para rotear a primeira demanda!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
