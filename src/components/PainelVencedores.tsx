import { CardVencedor } from './CardVencedor';
import type { StatusSorteio } from '../lib/tipos';

export interface PropsPainelVencedores {
  /** Nomes já revelados. */
  readonly visiveis: readonly string[];
  /** Quantas vagas a lista final tem. */
  readonly total: number;
  readonly status: StatusSorteio;
}

/**
 * Grade única com os ganhadores.
 *
 * Existe um painel só, de propósito. Separar em dois blocos revelaria a origem
 * de cada nome, que é exatamente o que esta tela não deve mostrar.
 */
export function PainelVencedores({ visiveis, total, status }: PropsPainelVencedores) {
  const vagasPendentes = Math.max(total - visiveis.length, 0);
  const sorteando = status === 'sorteando';

  if (status === 'ocioso') {
    return (
      <section className="resultado resultado--vazio" aria-labelledby="titulo-resultado">
        <h2 className="resultado__titulo" id="titulo-resultado">
          Resultado
        </h2>
        <p className="resultado__espera">
          Os {total} ganhadores aparecerão aqui depois do sorteio.
        </p>
      </section>
    );
  }

  return (
    <section className="resultado" aria-labelledby="titulo-resultado">
      <div className="resultado__cabecalho">
        <h2 className="resultado__titulo" id="titulo-resultado">
          {sorteando ? 'Sorteando' : 'Ganhadores'}
        </h2>
        <span className="resultado__progresso">
          {visiveis.length} de {total}
        </span>
      </div>

      {/* aria-live anuncia cada nome no instante em que aparece, em vez de
          exigir que o usuário de leitor de tela reexplore a lista. */}
      <div aria-live="polite" aria-atomic="false">
        <ol className="grade">
          {visiveis.map((username, indice) => (
            <CardVencedor key={username} username={username} posicao={indice + 1} />
          ))}

          {Array.from({ length: vagasPendentes }, (_, indice) => {
            const posicao = visiveis.length + indice + 1;
            const ehProxima = sorteando && indice === 0;

            return (
              <li
                className={`vencedor vencedor--vazio ${ehProxima ? 'vencedor--proximo' : ''}`}
                key={`vaga-${posicao}`}
              >
                <span className="vencedor__numero" aria-hidden="true">
                  {posicao}
                </span>
                <span className="vencedor__nome vencedor__nome--vazio" aria-hidden="true">
                  &nbsp;
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
