/**
 * Tipos compartilhados do domínio de sorteio.
 */

/** Estados possíveis do sorteio. */
export type StatusSorteio = 'ocioso' | 'sorteando' | 'concluido';

/**
 * Os campos de um comentário exportado que o sorteio realmente lê.
 *
 * A exportação traz muito mais coisa (commentPk, likes, text, date, source...),
 * mas nada disso influencia o resultado, então não é modelado aqui. Os dois
 * campos são `unknown` porque o JSON vem de fora e precisa ser validado antes
 * de qualquer uso.
 */
export interface ComentarioBruto {
  /** Quem comentou. É o único dado que entra no sorteio. */
  readonly username?: unknown;
  /** Perfil que publicou o post, usado para excluir o autor do sorteio. */
  readonly sourceUsername?: unknown;
}

/**
 * Resultado da leitura do JSON de comentários, com números de auditoria.
 *
 * Os contadores existem para que o sorteio seja explicável: dá para mostrar
 * na tela por que 45 comentários viraram 41 candidatos.
 */
export interface ExtracaoCandidatos {
  /** Usernames elegíveis, sem repetição, na ordem de primeira aparição. */
  readonly candidatos: readonly string[];
  /** Quantidade de registros lidos do JSON. */
  readonly totalComentarios: number;
  /** Registros descartados por não ter um username válido. */
  readonly invalidos: number;
  /** Comentários repetidos do mesmo usuário. */
  readonly duplicados: number;
  /** Usernames removidos por já serem pré-selecionados ou estarem bloqueados. */
  readonly excluidos: number;
}
