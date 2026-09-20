/**
 * Efeito visual de nomes girando durante o sorteio.
 *
 * Puramente decorativo: é o equivalente ao tambor girando antes da bolinha
 * parar. Percorre a lista em sequência, sem sortear nada e sem consultar
 * nenhuma fonte de aleatoriedade, justamente para não haver dúvida de que o
 * resultado não passa por aqui. Quem decide os ganhadores é `lib/sorteio.ts`.
 */

import { useEffect, useState } from 'react';

/** Velocidade da troca de nomes no painel, em milissegundos. */
const INTERVALO_ROLAGEM_MS = 75;

export function useRolagem(
  nomes: readonly string[],
  ativo: boolean,
  intervaloMs: number = INTERVALO_ROLAGEM_MS,
): string | null {
  const [indice, setIndice] = useState(0);

  useEffect(() => {
    if (!ativo || nomes.length === 0) {
      return;
    }

    const id = window.setInterval(() => {
      setIndice((anterior) => anterior + 1);
    }, intervaloMs);

    return () => {
      window.clearInterval(id);
    };
  }, [ativo, nomes.length, intervaloMs]);

  if (nomes.length === 0) {
    return null;
  }

  return nomes[indice % nomes.length] ?? null;
}
