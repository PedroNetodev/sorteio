/**
 * A operação de sorteio em si.
 *
 * Função pura e sem dependência de React: recebe o pool, devolve os vencedores.
 * Isso mantém a regra auditável e testável isoladamente da interface.
 */

import { embaralhar } from './aleatorio';

/** Erro lançado quando não há candidatos suficientes para sortear. */
export class PoolVazioError extends Error {
  constructor() {
    super('Não há candidatos elegíveis no JSON para realizar o sorteio.');
    this.name = 'PoolVazioError';
  }
}

export interface ResultadoSorteio {
  /** Vencedores, já na ordem aleatória em que devem ser revelados. */
  readonly sorteados: readonly string[];
  /** Tamanho do pool no momento do sorteio. */
  readonly totalCandidatos: number;
  /** Verdadeiro quando o pool era menor que a quantidade pedida. */
  readonly poolInsuficiente: boolean;
}

/**
 * Sorteia `quantidade` nomes distintos do pool.
 *
 * Embaralha o pool inteiro e corta os primeiros N. Fazer um único embaralhamento
 * completo, em vez de N sorteios individuais, já garante que ninguém repita e
 * que a ordem do resultado também seja aleatória: os dois requisitos de uma vez.
 *
 * A ordem devolvida é a ordem de revelação. A animação na interface apenas
 * exibe esta lista aos poucos, sem sortear nada durante o processo.
 */
export function sortear(candidatos: readonly string[], quantidade: number): ResultadoSorteio {
  if (!Number.isInteger(quantidade) || quantidade < 0) {
    throw new RangeError(`quantidade deve ser um inteiro não negativo, recebido: ${quantidade}`);
  }
  if (candidatos.length === 0) {
    throw new PoolVazioError();
  }

  const embaralhados = embaralhar(candidatos);
  const totalSorteado = Math.min(quantidade, embaralhados.length);

  return {
    sorteados: embaralhados.slice(0, totalSorteado),
    totalCandidatos: candidatos.length,
    poolInsuficiente: candidatos.length < quantidade,
  };
}
