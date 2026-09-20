import { CardParticipante } from './CardParticipante';
import type { StatusSorteio } from '../lib/tipos';

export interface PropsPainelSorteados {
  /** Vencedores já revelados na tela. */
  readonly visiveis: readonly string[];
  /** Quantas vagas existem no total. */
  readonly quantidade: number;
  /** Número da primeira vaga, para continuar a contagem da lista fixa. */
  readonly posicaoInicial: number;
  readonly status: StatusSorteio;
}

export function PainelSorteados({
  visiveis,
  quantidade,
  posicaoInicial,
  status,
}: PropsPainelSorteados) {
  const vagasPendentes = Math.max(quantidade - visiveis.length, 0);
  const sorteando = status === 'sorteando';

  return (
    <section className="painel painel--destaque" aria-labelledby="titulo-sorteados">
      <header className="painel__cabecalho">
        <h2 className="painel__titulo" id="titulo-sorteados">
          Sorteados
        </h2>
        <span className="painel__contador">
          {visiveis.length}/{quantidade}
        </span>
      </header>

      <p className="painel__descricao">
        Tirados aleatoriamente dos comentários. A ordem de exibição também é aleatória.
      </p>

      {/* aria-live faz o leitor de tela anunciar cada nome no momento em que
          aparece, em vez de exigir que o usuário reexplore a lista. */}
      <div aria-live="polite" aria-atomic="false">
        <ol className="lista" start={posicaoInicial}>
          {visiveis.map((username, indice) => (
            <CardParticipante
              key={username}
              username={username}
              origem="sorteado"
              posicao={posicaoInicial + indice}
            />
          ))}

          {Array.from({ length: vagasPendentes }, (_, indice) => {
            const ehProxima = sorteando && indice === 0;
            const posicao = posicaoInicial + visiveis.length + indice;

            return (
              <li
                className={`card card--vazio ${ehProxima ? 'card--sorteando' : ''}`}
                key={`vaga-${posicao}`}
              >
                <span className="card__posicao" aria-hidden="true">
                  {posicao}
                </span>
                <span className="card__nome card__nome--vazio">
                  {ehProxima ? 'sorteando…' : 'aguardando'}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
