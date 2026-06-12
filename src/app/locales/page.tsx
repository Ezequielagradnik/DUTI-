import { redirect } from "next/navigation";

// El listado público se quitó: cada local tiene su propia URL (/local/[slug])
// y comparte ese link directo con sus clientes.
export default function LocalesPage() {
  redirect("/");
}
