import type { ExtracaoCandidatos, StatusSorteio } from '../lib/tipos';

export interface PropsControlesSorteio {
  readonly status: StatusSorteio;
  readonly quantidade: number;
  readonly extracao: ExtracaoCandidatos;
  readonly onSortear: () => void;
  readonly onReiniciar: () => void;
}

export function ControlesSorteio({
  status,
  quantidade,
  extracao,
  onSortear,
  onReiniciar,
}: PropsControlesSorteio) {
  const sorteando = status === 'sorteando';
  const concluido = status === 'concluido';
  const semCandidatos = extracao.candidatos.length === 0;

  const rotuloBotao = sorteando
    ? 'Sorteando…'
    : concluido
      ? 'Sortear novamente'
      : `Sortear ${quantidade} nomes`;

  return (
    <div className="controles">
      <div className="controles__acoes">
        <button
          className="botao botao--primario"
          disabled={sorteando || semCandidatos}
          onClick={onSortear}
          type="button"
        >
          {rotuloBotao}
        </button>

        <button
          className="botao botao--secundario"
          disabled={sorteando || status === 'ocioso'}
          onClick={onReiniciar}
          type="button"
        >
          Limpar
        </button>
      </div>

      {/* Os números tornam o sorteio conferível: mostram exatamente quantos
          comentários entraram e por que o pool ficou menor que o total. */}
      <dl className="estatisticas">
        <div className="estatisticas__item">
          <dt>Comentários lidos</dt>
          <dd>{extracao.totalComentarios}</dd>
        </div>
        <div className="estatisticas__item">
          <dt>Candidatos elegíveis</dt>
          <dd>{extracao.candidatos.length}</dd>
        </div>
        <div className="estatisticas__item">
          <dt>Repetidos removidos</dt>
          <dd>{extracao.duplicados}</dd>
        </div>
        <div className="estatisticas__item">
          <dt>Excluídos</dt>
          <dd>{extracao.excluidos}</dd>
        </div>
        {extracao.invalidos > 0 ? (
          <div className="estatisticas__item">
            <dt>Sem username</dt>
            <dd>{extracao.invalidos}</dd>
          </div>
        ) : null}
      </dl>
    </div>
  );
}
