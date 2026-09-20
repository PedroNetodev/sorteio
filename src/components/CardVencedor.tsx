export interface PropsCardVencedor {
  readonly username: string;
  readonly posicao: number;
}

/**
 * Formata o nome para exibição.
 *
 * O "@" só entra quando o valor realmente parece um handle. Alguns nomes têm
 * espaço no meio (nome de exibição, não username), e prefixar esses casos
 * ficaria errado.
 */
function formatarExibicao(username: string): string {
  return username.includes(' ') ? username : `@${username}`;
}

/**
 * Um ganhador na grade de resultados.
 *
 * Todos os cartões são idênticos por decisão de produto: nada na marcação ou no
 * estilo indica de onde o nome veio. O número é só a ordem de saída, não
 * classificação.
 */
export function CardVencedor({ username, posicao }: PropsCardVencedor) {
  return (
    <li className="vencedor">
      <span className="vencedor__numero" aria-hidden="true">
        {posicao}
      </span>
      <span className="vencedor__nome" title={username}>
        {formatarExibicao(username)}
      </span>
    </li>
  );
}
