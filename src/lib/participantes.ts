/**
 * Leitura do JSON de comentários e montagem do pool de candidatos.
 *
 * O JSON vem de uma exportação externa, então nada aqui confia no formato:
 * cada campo é validado antes de ser usado. Apenas `username` importa para o
 * sorteio; todos os outros campos do comentário são ignorados.
 */

import type { ComentarioBruto, ExtracaoCandidatos } from './tipos';

/**
 * Normaliza um valor cru em um username exibível.
 *
 * Remove espaços nas pontas e um eventual "@" no início, que aparece quando o
 * nome é copiado de uma menção. Devolve `null` se não houver nome utilizável.
 */
export function normalizarUsername(valor: unknown): string | null {
  if (typeof valor !== 'string') {
    return null;
  }

  const limpo = valor.trim().replace(/^@+/, '').trim();
  return limpo.length > 0 ? limpo : null;
}

/**
 * Chave usada para comparar dois usernames.
 *
 * Usernames do Instagram não diferenciam maiúsculas de minúsculas, então
 * "Maria" e "maria" são a mesma pessoa e não podem concorrer duas vezes.
 */
export function chaveDeComparacao(username: string): string {
  return username.trim().toLocaleLowerCase('pt-BR');
}

/**
 * Aceita tanto um array puro quanto os formatos de wrapper mais comuns.
 *
 * Exportadores de comentários às vezes entregam `{ "comments": [...] }` ou
 * `{ "data": [...] }` em vez do array direto. Tratar isso aqui evita que o
 * usuário precise editar o arquivo à mão.
 */
export function lerListaDeComentarios(dados: unknown): readonly unknown[] {
  if (Array.isArray(dados)) {
    return dados;
  }

  if (typeof dados === 'object' && dados !== null) {
    const registro = dados as Record<string, unknown>;
    for (const chave of ['comments', 'comentarios', 'data', 'items', 'results']) {
      const valor = registro[chave];
      if (Array.isArray(valor)) {
        return valor;
      }
    }
  }

  throw new TypeError(
    'JSON inválido: era esperado um array de comentários, ou um objeto com a lista em "comments"/"data".',
  );
}

/** Opções de filtragem aplicadas ao montar o pool. */
export interface OpcoesExtracao {
  /** Usernames que não podem ser sorteados (pré-selecionados, bloqueados). */
  readonly excluir?: readonly string[];
  /** Se verdadeiro, remove o autor da publicação (campo `sourceUsername`). */
  readonly excluirAutorDaPublicacao?: boolean;
}

/**
 * Extrai os usernames elegíveis de uma lista de comentários.
 *
 * A ordem de primeira aparição é preservada. Isso não afeta a justiça do
 * sorteio, porque a lista é embaralhada por completo antes do corte, mas torna
 * o pool estável e conferível entre execuções.
 */
export function extrairCandidatos(
  comentarios: readonly unknown[],
  opcoes: OpcoesExtracao = {},
): ExtracaoCandidatos {
  const { excluir = [], excluirAutorDaPublicacao = false } = opcoes;

  const bloqueados = new Set<string>();
  for (const nome of excluir) {
    const normalizado = normalizarUsername(nome);
    if (normalizado !== null) {
      bloqueados.add(chaveDeComparacao(normalizado));
    }
  }

  if (excluirAutorDaPublicacao) {
    for (const item of comentarios) {
      if (typeof item !== 'object' || item === null) {
        continue;
      }
      const autor = normalizarUsername((item as ComentarioBruto).sourceUsername);
      if (autor !== null) {
        bloqueados.add(chaveDeComparacao(autor));
      }
    }
  }

  const vistos = new Set<string>();
  const candidatos: string[] = [];
  let invalidos = 0;
  let duplicados = 0;
  let excluidos = 0;

  for (const item of comentarios) {
    if (typeof item !== 'object' || item === null) {
      invalidos += 1;
      continue;
    }

    const username = normalizarUsername((item as ComentarioBruto).username);
    if (username === null) {
      invalidos += 1;
      continue;
    }

    const chave = chaveDeComparacao(username);

    if (vistos.has(chave)) {
      duplicados += 1;
      continue;
    }
    vistos.add(chave);

    if (bloqueados.has(chave)) {
      excluidos += 1;
      continue;
    }

    candidatos.push(username);
  }

  return {
    candidatos,
    totalComentarios: comentarios.length,
    invalidos,
    duplicados,
    excluidos,
  };
}

/**
 * Normaliza a lista de pré-selecionados, removendo repetições e vazios.
 *
 * Aceita um array de strings ou de objetos com a propriedade `username`, para
 * que a mesma exportação de comentários possa ser usada como lista fixa.
 */
export function lerPreSelecionados(dados: unknown): readonly string[] {
  if (!Array.isArray(dados)) {
    throw new TypeError('preSelecionados.json deve conter um array.');
  }

  // Array.isArray estreita unknown para any[]; reafirmar como unknown[] mantém
  // a validação item por item obrigatória.
  const lista: readonly unknown[] = dados;
  const vistos = new Set<string>();
  const nomes: string[] = [];

  for (const item of lista) {
    const bruto =
      typeof item === 'object' && item !== null ? (item as ComentarioBruto).username : item;

    const username = normalizarUsername(bruto);
    if (username === null) {
      continue;
    }

    const chave = chaveDeComparacao(username);
    if (vistos.has(chave)) {
      continue;
    }

    vistos.add(chave);
    nomes.push(username);
  }

  return nomes;
}
