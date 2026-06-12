import { Supplier, PurchaseRequest } from '../types';

export const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: 'opcao-informatica',
    name: 'Opção Informática',
    category: 'Tecnologia & Equipamentos',
    contact: 'Vendas - Carlos Eduardo',
    email: 'comercial@opcaoinfo.com.br'
  },
  {
    id: 'global-distribuidora',
    name: 'Global Distribuidora',
    category: 'Materiais de Escritório',
    contact: 'Suporte Corporativo',
    email: 'pedidos@globaldistribuidora.com.br'
  },
  {
    id: 'nacional-papelaria',
    name: 'Nacional Papelaria',
    category: 'Suprimentos Gerais',
    contact: 'Regina Sousa',
    email: 'vendas@nacionalpapelaria.com.br'
  },
  {
    id: 'construtora-alfa',
    name: 'Construtora Alfa',
    category: 'Manutenção & Construção',
    contact: 'Eng. Roberto Ramos',
    email: 'obras@construtoraalfa.com.br'
  }
];

export const BRANCHES_EX: string[] = [
  "Filial 01",
  "Filial 02",
  "Filial 03",
  "Filial 04",
  "Filial 05",
  "Filial 06",
  "Filial 07",
  "Filial 08",
  "Filial 09",
  "Filial 10",
  "Filial 11",
  "Filial 12",
  "Filial 13",
  "Filial 14",
  "Filial 15",
  "Filial 16",
  "Filial 17",
  "Filial 18",
  "Filial 19",
  "Filial 20",
  "Filial 21",
  "Filial 22",
  "Filial 23",
  "Filial 24",
  "Filial 25",
  "Filial 26",
  "Filial 27",
  "Filial 28",
  "Filial 29",
  "Filial 30",
  "Filial 31",
  "Filial 32",
  "Filial 33",
  "Filial 34"
];

export const INITIAL_REQUESTS: PurchaseRequest[] = [
  {
    id: 'ID145978',
    supplierId: 'opcao-informatica',
    description: 'Aquisição de 5 Notebooks Corporativos i7 Intel',
    value: 18500.00,
    status: 'Pendente',
    date: '2026-06-12',
    branch: 'Filial 01'
  },
  {
    id: 'ID220491',
    supplierId: 'global-distribuidora',
    description: 'Lote de Cadeiras de Escritório Ergonômicas',
    value: 4200.00,
    status: 'Em Cotação',
    date: '2026-06-11',
    branch: 'Filial 02'
  },
  {
    id: 'ID193855',
    supplierId: 'opcao-informatica',
    description: 'Monitores Extensores HDMI IPS 27"',
    value: 2900.00,
    status: 'Enviado',
    date: '2026-06-10',
    branch: 'Filial 05'
  }
];
