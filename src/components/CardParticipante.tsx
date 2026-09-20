import type { OrigemParticipante } from '../lib/tipos';

export interface PropsCardParticipante {
  readonly username: string;
  readonly origem: OrigemParticipante;
  readonly posicao: number;
}

/**
 * Formata o nome para exibição.
 *
 * O "@" só entra quando o valor realmente parece um handle. Alguns registros da
 * lista fixa têm espaço no meio (nome de exibição, não username), e prefixar
 * esses casos ficaria errado.
 */
function formatarExibicao(username: string): string {
  return username.includes(' ') ? username : `@${username}`;
}

export function CardParticipante({ username, origem, posicao }: PropsCardParticipante) {
  const ehSorteado = origem === 'sorteado';

  return (
    <li className={`card ${ehSorteado ? 'card--sorteado' : 'card--fixo'}`}>
      <span className="card__posicao" aria-hidden="true">
        {posicao}
      </span>

      <span className="card__nome" title={username}>
        {formatarExibicao(username)}
      </span>

      {ehSorteado ? (
        <span className="card__selo">sorteado</span>
      ) : (
        <span className="card__selo card__selo--fixo">garantido</span>
      )}
    </li>
  );
}
