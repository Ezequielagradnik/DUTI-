export const metadata = { title: "Contacto — DUTI" };

export default function Contacto() {
  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <h1 className="text-3xl font-bold text-navy">Contacto</h1>
      <p className="mt-2 text-muted">
        ¿Tenés un local o una consulta? Escribinos.
      </p>
      <div className="mt-6 space-y-3">
        <a
          href="https://wa.me/5491134307269?text=Hola!%20Tengo%20una%20consulta%20sobre%20DUTI"
          className="flex items-center gap-3 rounded-card border border-brdr bg-white p-4 hover:border-copper"
        >
          <span className="text-2xl">💬</span>
          <div>
            <p className="font-semibold text-navy">WhatsApp</p>
            <p className="text-sm text-muted">+54 9 11 3430-7269 · respuesta rápida</p>
          </div>
        </a>
        <a
          href="mailto:maxiglusman@gmail.com"
          className="flex items-center gap-3 rounded-card border border-brdr bg-white p-4 hover:border-copper"
        >
          <span className="text-2xl">✉️</span>
          <div>
            <p className="font-semibold text-navy">maxiglusman@gmail.com</p>
            <p className="text-sm text-muted">Para locales y soporte</p>
          </div>
        </a>
      </div>
    </div>
  );
}
