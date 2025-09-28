'use client';

import React, { useEffect, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { logger } from '@/lib/logger';

interface MathFormulaProps {
  expression: string;
  displayMode?: boolean;
}

export default function MathFormula({
  expression,
  displayMode = true
}: MathFormulaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = React.useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current || !expression) {
      return;
    }

    try {
      setError(null);
      katex.render(expression, containerRef.current, {
        displayMode,
        throwOnError: false,
        errorColor: '#cc0000',
        strict: false,
        trust: true,
        macros: {
          "\\RR": "\\mathbb{R}",
          "\\NN": "\\mathbb{N}",
          "\\ZZ": "\\mathbb{Z}",
          "\\QQ": "\\mathbb{Q}",
          "\\CC": "\\mathbb{C}",
        }
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      logger.error('KaTeX rendering error:', errorMessage);
      setError(errorMessage);

      // 显示原始 LaTeX 作为后备
      if (containerRef.current) {
        containerRef.current.innerHTML = `<code class="math-error">${expression}</code>`;
      }
    }
  }, [expression, displayMode]);

  return (
    <div
      ref={containerRef}
      className={`math-formula ${displayMode ? 'math-display' : 'math-inline'} ${error ? 'has-error' : ''}`}
      style={{
        textAlign: displayMode ? 'center' : 'inherit',
        margin: displayMode ? '1.5rem 0' : '0',
        padding: displayMode ? '0.5rem' : '0',
        overflowX: 'auto',
        overflowY: 'hidden',
      }}
      title={error ? `Error: ${error}` : undefined}
    />
  );
}