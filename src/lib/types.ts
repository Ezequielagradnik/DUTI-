// Domain types for DUTI

export type Categoria =
  | "Hamburguesas"
  | "Pizza"
  | "Sushi"
  | "Saludable"
  | "Postres"
  | "Cafetería"
  | "Milanesas"
  | "Vegetariano";

export interface Local {
  id: string;
  nombre: string;
  slug: string;
  logo_url: string | null;
  portada_url: string | null;
  descripcion: string | null;
  categoria: Categoria;
  tiempo_estimado_min: number; // estimated prep time
  alias_cobro: string | null; // CBU/alias for transfers
  activo: boolean;
  horario_apertura: string | null; // "09:00"
  horario_cierre: string | null; // "23:00"
}

export interface Plato {
  id: string;
  local_id: string;
  nombre: string;
  descripcion: string | null;
  precio: number;
  foto_url: string | null;
  categoria: string | null;
  disponible: boolean;
}

export interface Slot {
  id: string;
  local_id: string;
  hora: string; // "12:30"
  capacidad_max: number;
  ocupados: number;
}

export type EstadoPedido =
  | "pendiente_pago"
  | "verificando"
  | "confirmado"
  | "sospechoso"
  | "rechazado"
  | "en_preparacion"
  | "listo"
  | "retirado";

export interface ItemPedido {
  plato_id: string;
  nombre: string;
  precio: number;
  cantidad: number;
}

export interface Pedido {
  id: string;
  local_id: string;
  usuario_id: string | null;
  items: ItemPedido[];
  subtotal: number;
  total: number; // total con centavos únicos
  horario_retiro: string;
  estado: EstadoPedido;
  comprobante_url: string | null;
  nombre_cliente: string | null;
  telefono_cliente: string | null;
  creado_en: string;
}

// Item del carrito en localStorage
export interface CartItem {
  plato_id: string;
  nombre: string;
  precio: number;
  cantidad: number;
  foto_url: string | null;
}
