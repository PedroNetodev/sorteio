import type { StatusSorteio } from '../lib/tipos';

export interface PropsPalcoSorteio {
  readonly status: StatusSorteio;
  /** Nome exibido no painel durante o giro. Apenas decorativo. */
  readonly nomeRolando: string | null;
  readonly totalParticipantes: number;
  readonly totalVencedores: number;
  readonly revelados: number;
  readonly podeSortear: boolean;
  readonly onSortear: () => void;
  readonly onReiniciar: () => void;
}

/**
 * O "tambor" do sorteio: painel central, contadores e botão de ação.
 *
 * O nome que gira no painel é enfeite. Os ganhadores já estão definidos quando
 * o giro começa.
 */
export function PalcoSorteio({
  status,
  nomeRolando,
  totalParticipantes,
  totalVencedores,
  revelados,
  podeSortear,
  onSortear,
  onReiniciar,
}: PropsPalcoSorteio) {
  const sorteando = status === 'sorteando';
  const concluido = status === 'concluido';

  return (
    <section className="palco" aria-label="Painel do sorteio">
      <div className="palco__medidores">
        <div className="medidor">
          <span className="medidor__valor">{totalParticipantes}</span>
          <span className="medidor__rotulo">
            {totalParticipantes === 1 ? 'participante' : 'participantes'}
          </span>
        </div>
        <div className="medidor">
          <span className="medidor__valor">{totalVencedores}</span>
          <span className="medidor__rotulo">
            {totalVencedores === 1 ? 'ganhador' : 'ganhadores'}
          </span>
        </div>
      </div>

      <div className={`visor ${sorteando ? 'visor--girando' : ''} ${concluido ? 'visor--final' : ''}`}>
        {sorteando ? (
          <>
            <span className="visor__nome" aria-hidden="true">
              {nomeRolando ?? '…'}
            </span>
            <span className="visor__legenda">
              Sorteando {revelados + 1} de {totalVencedores}
            </span>
          </>
        ) : concluido ? (
          <>
            <span className="visor__nome visor__nome--final">Sorteio concluído</span>
            <span className="visor__legenda">
              {totalVencedores} {totalVencedores === 1 ? 'ganhador definido' : 'ganhadores definidos'}
            </span>
          </>
        ) : (
          <>
            <span className="visor__nome visor__nome--ocioso">Pronto para sortear</span>
            <span className="visor__legenda">
              {podeSortear
                ? `${totalVencedores} nomes serão sorteados`
                : 'Carregue um arquivo com participantes'}
            </span>
          </>
        )}
      </div>

      <div className="palco__acoes">
        <button
          className="botao botao--girar"
          disabled={sorteando || !podeSortear}
          onClick={onSortear}
          type="button"
        >
          {sorteando ? 'Sorteando…' : concluido ? 'Sortear de novo' : 'Realizar sorteio'}
        </button>

        {concluido ? (
          <button className="botao botao--discreto" onClick={onReiniciar} type="button">
            Limpar resultado
          </button>
        ) : null}
      </div>
    </section>
  );
}
