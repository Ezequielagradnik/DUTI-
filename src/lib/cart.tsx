"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CartItem } from "./types";

const STORAGE_KEY = "duti.cart.v1";

interface CartState {
  localId: string | null;
  items: CartItem[];
}

interface CartContextValue extends CartState {
  count: number;
  subtotal: number;
  add: (localId: string, item: Omit<CartItem, "cantidad">, cantidad?: number) => void;
  setCantidad: (platoId: string, cantidad: number) => void;
  remove: (platoId: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CartState>({ localId: null, items: [] });
  const [hydrated, setHydrated] = useState(false);

  // Cargar desde localStorage al montar
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setState(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  // Persistir
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, hydrated]);

  function add(
    localId: string,
    item: Omit<CartItem, "cantidad">,
    cantidad = 1
  ) {
    setState((prev) => {
      // El carrito es de un solo local: si cambia, se reinicia.
      const base =
        prev.localId && prev.localId !== localId
          ? { localId, items: [] as CartItem[] }
          : { localId, items: prev.items };
      const idx = base.items.findIndex((i) => i.plato_id === item.plato_id);
      let items: CartItem[];
      if (idx >= 0) {
        items = base.items.map((i, k) =>
          k === idx ? { ...i, cantidad: i.cantidad + cantidad } : i
        );
      } else {
        items = [...base.items, { ...item, cantidad }];
      }
      return { localId, items };
    });
  }

  function setCantidad(platoId: string, cantidad: number) {
    setState((prev) => {
      if (cantidad <= 0) {
        const items = prev.items.filter((i) => i.plato_id !== platoId);
        return { localId: items.length ? prev.localId : null, items };
      }
      return {
        ...prev,
        items: prev.items.map((i) =>
          i.plato_id === platoId ? { ...i, cantidad } : i
        ),
      };
    });
  }

  function remove(platoId: string) {
    setState((prev) => {
      const items = prev.items.filter((i) => i.plato_id !== platoId);
      return { localId: items.length ? prev.localId : null, items };
    });
  }

  function clear() {
    setState({ localId: null, items: [] });
  }

  const value = useMemo<CartContextValue>(() => {
    const count = state.items.reduce((a, i) => a + i.cantidad, 0);
    const subtotal = state.items.reduce((a, i) => a + i.precio * i.cantidad, 0);
    return { ...state, count, subtotal, add, setCantidad, remove, clear };
  }, [state]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de <CartProvider>");
  return ctx;
}
