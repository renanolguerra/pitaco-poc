"use client";

import { useState, useEffect } from "react";

export default function MobileWarning() {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    const wasDismissed = sessionStorage.getItem("mobile-warning-dismissed");
    if (isMobile && !wasDismissed) setShow(true);
  }, []);

  function handleContinue() {
    sessionStorage.setItem("mobile-warning-dismissed", "true");
    setDismissed(true);
    setShow(false);
  }

  if (!show || dismissed) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl">
        <div className="text-4xl mb-3 text-center">💻</div>
        <h2 className="text-lg font-bold text-foreground text-center mb-2">
          Melhor no desktop
        </h2>
        <p className="text-muted-foreground text-sm text-center mb-6">
          O Pitaco foi projetado para ser usado no computador. A experiência no celular pode ser limitada.
        </p>
        <button
          onClick={handleContinue}
          className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium text-sm"
        >
          Quero continuar mesmo assim
        </button>
      </div>
    </div>
  );
}
