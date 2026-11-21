import React, { useState } from 'react';
import { Download, Share, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        className="btn-primary-glow flex min-h-[44px] items-center gap-1.5 rounded-2xl px-3.5 text-xs font-semibold text-[#F5F7FA] whitespace-nowrap shrink-0 active:scale-[0.98]"
      >
        <Download className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
        Instalar app
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className="neu-btn-secondary flex min-h-[44px] items-center gap-1.5 rounded-2xl px-3.5 text-xs font-semibold text-[#F5F7FA] whitespace-nowrap shrink-0 active:scale-[0.98]"
        >
          <Download className="h-4 w-4 text-[#70B7F0]" strokeWidth={1.75} aria-hidden="true" />
          Instalar
        </button>

        {showIOSGuide && (
          <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/65 backdrop-blur-sm p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ios-install-title"
          >
            <div className="neu-card w-full max-w-[420px] p-5">
              <div className="flex items-center justify-between gap-3">
                <h3 id="ios-install-title" className="card-title">
                  Instalar na tela inicial
                </h3>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  aria-label="Fechar instruções"
                  className="neu-btn-secondary flex h-11 w-11 items-center justify-center rounded-2xl text-[#9AA6B8] hover:text-[#F5F7FA] active:scale-[0.98]"
                >
                  <X className="h-4 w-4" strokeWidth={1.75} />
                </button>
              </div>
              <ol className="mt-4 space-y-3 text-sm text-[#9AA6B8] leading-relaxed">
                <li className="flex items-start gap-2.5">
                  <span className="font-semibold text-[#70B7F0]">1.</span>
                  <span>
                    Toque no botão{' '}
                    <strong className="inline-flex items-center gap-1 font-semibold text-[#F5F7FA]">
                      Compartilhar <Share className="h-4 w-4 text-[#70B7F0]" strokeWidth={1.75} />
                    </strong>{' '}
                    na barra do Safari.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="font-semibold text-[#70B7F0]">2.</span>
                  <span>
                    Role para baixo e toque em{' '}
                    <strong className="font-semibold text-[#F5F7FA]">
                      Adicionar à Tela de Início
                    </strong>
                    .
                  </span>
                </li>
              </ol>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="btn-primary-glow mt-4 w-full min-h-[48px] rounded-2xl text-sm font-semibold text-[#F5F7FA] active:scale-[0.98]"
              >
                Entendi
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
