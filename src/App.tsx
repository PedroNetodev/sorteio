import { useCallback, useMemo, useState } from 'react';

import { ControlesSorteio } from './components/ControlesSorteio';
import { ImportarJson } from './components/ImportarJson';
import { PainelPreSelecionados } from './components/PainelPreSelecionados';
import { PainelSorteados } from './components/PainelSorteados';
import comentariosPadrao from './data/comentarios.json';
import preSelecionadosPadrao from './data/preSelecionados.json';
import { useSorteio } from './hooks/useSorteio';
import { aleatoriedadeDisponivel } from './lib/aleatorio';
import {
  EXCLUIR_AUTOR_DA_PUBLICACAO,
  QUANTIDADE_SORTEADOS,
  USUARIOS_BLOQUEADOS,
} from './lib/config';
import {
  extrairCandidatos,
  lerListaDeComentarios,
  lerPreSelecionados,
} from './lib/participantes';

export default function App() {
  const [comentarios, setComentarios] = useState<readonly unknown[]>(
    () => lerListaDeComentarios(comentariosPadrao),
  );
  const [nomeArquivo, setNomeArquivo] = useState<string | null>(null);
  const [erroImportacao, setErroImportacao] = useState<string | null>(null);

  // A lista fixa vem do JSON e é normalizada uma única vez.
  const preSelecionados = useMemo(() => lerPreSelecionados(preSelecionadosPadrao), []);

  // O pool é derivado: muda sozinho quando um novo arquivo é carregado.
  const extracao = useMemo(
    () =>
      extrairCandidatos(comentarios, {
        excluir: [...preSelecionados, ...USUARIOS_BLOQUEADOS],
        excluirAutorDaPublicacao: EXCLUIR_AUTOR_DA_PUBLICACAO,
      }),
    [comentarios, preSelecionados],
  );

  const {
    status,
    sorteadosVisiveis,
    erro: erroSorteio,
    poolInsuficiente,
    executarSorteio,
    reiniciar,
  } = useSorteio({
    candidatos: extracao.candidatos,
    quantidade: QUANTIDADE_SORTEADOS,
  });

  const carregarArquivo = useCallback(
    (dados: unknown, nome: string) => {
      try {
        const lista = lerListaDeComentarios(dados);
        setComentarios(lista);
        setNomeArquivo(nome);
        setErroImportacao(null);
        // Um pool novo invalida qualquer resultado anterior.
        reiniciar();
      } catch (erro) {
        setErroImportacao(erro instanceof Error ? erro.message : 'JSON inválido.');
      }
    },
    [reiniciar],
  );

  const semAleatoriedadeSegura = !aleatoriedadeDisponivel();
  const totalFinal = preSelecionados.length + QUANTIDADE_SORTEADOS;
  const mensagemDeAviso = erroImportacao ?? erroSorteio;

  return (
    <div className="pagina">
      <header className="cabecalho">
        <p className="cabecalho__etiqueta">Sorteio.com</p>
        <h1 className="cabecalho__titulo">
          {preSelecionados.length} garantidos + {QUANTIDADE_SORTEADOS} sorteados
        </h1>
        <p className="cabecalho__subtitulo">
          {totalFinal} participantes no total. Os {preSelecionados.length} primeiros já estão
          definidos; os {QUANTIDADE_SORTEADOS} últimos saem dos comentários, em ordem aleatória.
        </p>
      </header>

      {semAleatoriedadeSegura ? (
        <p className="alerta alerta--erro" role="alert">
          Este navegador não oferece uma fonte de aleatoriedade segura
          (<code>crypto.getRandomValues</code>). O sorteio ficará indisponível. Abra a página em um
          navegador atualizado, via <code>http://</code> ou <code>https://</code>.
        </p>
      ) : null}

      {mensagemDeAviso !== null ? (
        <p className="alerta alerta--erro" role="alert">
          {mensagemDeAviso}
        </p>
      ) : null}

      {poolInsuficiente ? (
        <p className="alerta alerta--atencao" role="status">
          O JSON tem menos de {QUANTIDADE_SORTEADOS} candidatos elegíveis. Todos os disponíveis
          foram sorteados.
        </p>
      ) : null}

      <ImportarJson
        desabilitado={status === 'sorteando'}
        nomeArquivo={nomeArquivo}
        onCarregar={carregarArquivo}
        onErro={setErroImportacao}
      />

      <ControlesSorteio
        extracao={extracao}
        onReiniciar={reiniciar}
        onSortear={executarSorteio}
        quantidade={QUANTIDADE_SORTEADOS}
        status={status}
      />

      <main className="conteudo">
        <PainelPreSelecionados nomes={preSelecionados} />
        <PainelSorteados
          posicaoInicial={preSelecionados.length + 1}
          quantidade={QUANTIDADE_SORTEADOS}
          status={status}
          visiveis={sorteadosVisiveis}
        />
      </main>

      <footer className="rodape">
        <p>
          Sorteio executado no navegador com <code>crypto.getRandomValues</code> e embaralhamento
          Fisher-Yates. Nomes repetidos e pré-selecionados são removidos do pool antes do sorteio.
        </p>
      </footer>
    </div>
  );
}
