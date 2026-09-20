/**
 * Aleatoriedade para sorteio.
 *
 * Usa `crypto.getRandomValues` em vez de `Math.random()`. O motivo não é
 * performance: `Math.random()` não garante imprevisibilidade e a semente pode
 * ser inferida. Num sorteio, isso é um problema de confiança no resultado.
 * O custo das duas abordagens é equivalente na escala de alguns milhares de
 * nomes, então não há razão para usar a versão mais fraca.
 */

const LIMITE_UINT32 = 2 ** 32;

/** Erro lançado quando o ambiente não oferece uma fonte de aleatoriedade segura. */
export class AleatoriedadeIndisponivelError extends Error {
  constructor() {
    super(
      'Este navegador não expõe crypto.getRandomValues, necessário para um sorteio confiável. ' +
        'Abra a aplicação em um navegador atualizado via http:// ou https://.',
    );
    this.name = 'AleatoriedadeIndisponivelError';
  }
}

/** Indica se o ambiente atual consegue gerar números aleatórios seguros. */
export function aleatoriedadeDisponivel(): boolean {
  return typeof globalThis.crypto?.getRandomValues === 'function';
}

/**
 * Sorteia um inteiro no intervalo [0, limiteExclusivo).
 *
 * Usa amostragem por rejeição para evitar viés de módulo: como 2^32 raramente
 * é divisível pelo tamanho do intervalo, aplicar `% n` direto favoreceria os
 * primeiros índices. Descartar os valores da faixa incompleta corrige isso e a
 * probabilidade de repetir o laço é desprezível.
 */
export function inteiroAleatorio(limiteExclusivo: number): number {
  if (!Number.isInteger(limiteExclusivo) || limiteExclusivo <= 0) {
    throw new RangeError(`limiteExclusivo deve ser um inteiro positivo, recebido: ${limiteExclusivo}`);
  }
  if (!aleatoriedadeDisponivel()) {
    throw new AleatoriedadeIndisponivelError();
  }
  if (limiteExclusivo === 1) {
    return 0;
  }

  const maiorMultiploValido = LIMITE_UINT32 - (LIMITE_UINT32 % limiteExclusivo);
  const buffer = new Uint32Array(1);

  let valor: number;
  do {
    globalThis.crypto.getRandomValues(buffer);
    valor = buffer[0] ?? 0;
  } while (valor >= maiorMultiploValido);

  return valor % limiteExclusivo;
}

/**
 * Devolve uma nova lista com os itens embaralhados (Fisher-Yates moderno).
 *
 * Não modifica a lista de entrada. Cada uma das n! permutações tem a mesma
 * probabilidade, o que é a propriedade que faz o sorteio ser justo.
 */
export function embaralhar<T>(itens: readonly T[]): T[] {
  const copia = [...itens];

  for (let i = copia.length - 1; i > 0; i -= 1) {
    const j = inteiroAleatorio(i + 1);
    // i e j estão comprovadamente dentro dos limites por construção do laço
    // (0 <= j <= i < copia.length), então a asserção é segura mesmo com
    // noUncheckedIndexedAccess ligado.
    const atual = copia[i]!;
    copia[i] = copia[j]!;
    copia[j] = atual;
  }

  return copia;
}
