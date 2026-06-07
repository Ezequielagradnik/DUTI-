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
  zona: string | null;
  rango_precio: number; // 1=$, 2=$$, 3=$$$
  tiempo_estimado_min: number; // estimated prep time
  alias_cobro: string | null; // CBU/alias for transfers
  activo: boolean;
  horario_apertura: string | null; // "09:00"
  horario_cierre: string | null; // "23:00"
  comision_pct: number; // platform commission %
  owner_id: string | null;
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

export type EstadoRevision = "revisado" | "rechazado" | "comprobado";

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
  estado_revision: string | null; // revisión (IA n8n o local): aprobado/revisar/comprobado/revisado/rechazado
  motivo_revision: string | null; // nota/motivo de la revisión
  desfasaje_precio: number; // pagado - total (negativo = pagó de menos)
  especificaciones: string | null; // aclaraciones del cliente para el local
  comprobante_base64: string | null; // imagen del comprobante (data URL)
  verificacion: unknown | null;
  nombre_cliente: string | null;
  telefono_cliente: string | null;
  created_at: string;
}

// Item del carrito en localStorage
export interface CartItem {
  plato_id: string;
  nombre: string;
  precio: number;
  cantidad: number;
  foto_url: string | null;
}
