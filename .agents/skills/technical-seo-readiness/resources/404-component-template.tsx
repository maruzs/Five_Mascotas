import React from 'react';

/**
 * Componente 404 de Grado Producción (Anti-Vibecoding)
 * Proporciona una experiencia limpia, sobria, sin emojis ni gradientes cliché,
 * con navegación clara de retorno y estética consistente.
 */
export default function NotFoundPage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Identificador numérico sutil de estado */}
        <p className="text-xs font-mono uppercase tracking-widest text-neutral-500">
          Error 404 — Página no encontrada
        </p>

        {/* Titular contundente y legible */}
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-neutral-50">
          La página que buscas no existe o ha sido movida
        </h1>

        {/* Texto descriptivo claro */}
        <p className="text-sm text-neutral-400 leading-relaxed">
          Verifica la dirección URL ingresada o regresa a la página principal para continuar navegando de forma segura.
        </p>

        {/* Acciones de navegación funcionales */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium rounded-lg bg-neutral-100 text-neutral-900 hover:bg-neutral-200 transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-400"
          >
            Volver al inicio
          </a>
          <a
            href="/docs"
            className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium rounded-lg border border-neutral-800 text-neutral-300 hover:bg-neutral-900 hover:text-neutral-100 transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-700"
          >
            Ver documentación
          </a>
        </div>
      </div>
    </main>
  );
}
