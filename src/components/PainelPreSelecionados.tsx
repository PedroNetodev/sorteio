import { CardParticipante } from './CardParticipante';

export interface PropsPainelPreSelecionados {
  readonly nomes: readonly string[];
}

/**
 * Lista fixa, exibida já no carregamento da página.
 *
 * Não participa de nenhum sorteio: estes nomes vêm direto do JSON de
 * pré-selecionados e a ordem é a do arquivo, de propósito, para conferência.
 */
export function PainelPreSelecionados({ nomes }: PropsPainelPreSelecionados) {
  return (
    <section className="painel" aria-labelledby="titulo-pre-selecionados">
      <header className="painel__cabecalho">
        <h2 className="painel__titulo" id="titulo-pre-selecionados">
          Pré-selecionados
        </h2>
        <span className="painel__contador">{nomes.length}</span>
      </header>

      <p className="painel__descricao">
        Confirmados de antemão. Não entram no sorteio e não podem ser sorteados novamente.
      </p>

      <ol className="lista">
        {nomes.map((username, indice) => (
          <CardParticipante
            key={username}
            username={username}
            origem="pre-selecionado"
            posicao={indice + 1}
          />
        ))}
      </ol>
    </section>
  );
}
