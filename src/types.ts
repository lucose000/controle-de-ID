export interface Supplier {
  id: string;
  name: string;
  category?: string;
  contact?: string;
  email?: string;
}

export type RequestStatus = 'Pendente' | 'Em Cotação' | 'Enviado' | 'Concluído' | 'Cancelado';

export interface PurchaseRequest {
  id: string; // The specific request ID entered by the user (e.g. ID145978)
  supplierId: string; // Routed reference to the supplier
  description: string;
  value: number;
  status: RequestStatus;
  date: string;
  branch: string; // Selected branch / store (filial) among the 34 stores
}
