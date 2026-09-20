import { useCallback, useMemo, useState } from 'react';

import { Confete } from './components/Confete';
import { ImportarJson } from './components/ImportarJson';
import { PainelVencedores } from './components/PainelVencedores';
import { PalcoSorteio } from './components/PalcoSorteio';
import comentariosPadrao from './data/comentarios.json';
import preSelecionadosPadrao from './data/preSelecionados.json';
import { useRolagem } from './hooks/useRolagem';
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
  const [comentarios, setComentarios] = useState<readonly unknown[]>(() =>
    lerListaDeComentarios(comentariosPadrao),
  );
  const [nomeArquivo, setNomeArquivo] = useState<string | null>(null);
  const [erroImportacao, setErroImportacao] = useState<string | null>(null);

  const preSelecionados = useMemo(() => lerPreSelecionados(preSelecionadosPadrao), []);

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
    vencedoresVisiveis,
    totalVencedores,
    erro: erroSorteio,
    poolInsuficiente,
    concluido,
    executarSorteio,
    reiniciar,
  } = useSorteio({
    candidatos: extracao.candidatos,
    fixos: preSelecionados,
    quantidade: QUANTIDADE_SORTEADOS,
  });

  // O visor gira sobre todos os participantes, sem separar as duas origens: se
  // rolasse apenas o pool do JSON, a ausência dos nomes fixos entregaria quem
  // eles são.
  const nomesParaRolar = useMemo(
    () => [...preSelecionados, ...extracao.candidatos],
    [preSelecionados, extracao.candidatos],
  );

  const nomeRolando = useRolagem(nomesParaRolar, status === 'sorteando');

  const carregarArquivo = useCallback(
    (dados: unknown, nome: string) => {
      try {
        const lista = lerListaDeComentarios(dados);
        setComentarios(lista);
        setNomeArquivo(nome);
        setErroImportacao(null);
        // Um conjunto novo de participantes invalida o resultado anterior.
        reiniciar();
      } catch (erro) {
        setErroImportacao(erro instanceof Error ? erro.message : 'JSON inválido.');
      }
    },
    [reiniciar],
  );

  const temAleatoriedadeSegura = aleatoriedadeDisponivel();
  const podeSortear = temAleatoriedadeSegura && extracao.candidatos.length > 0;
  const totalParticipantes = preSelecionados.length + extracao.candidatos.length;
  const mensagemDeErro = erroImportacao ?? erroSorteio;

  return (
    <div className="app">
      {concluido ? <Confete /> : null}

      <header className="topo">
        <p className="topo__marca">Sorteio online</p>
        <h1 className="topo__titulo">Sorteio de ganhadores</h1>
        <p className="topo__subtitulo">
          {totalVencedores} nomes são escolhidos entre os participantes e revelados um a um.
        </p>
      </header>

      <main className="miolo">
        {!temAleatoriedadeSegura ? (
          <p className="aviso aviso--erro" role="alert">
            Este navegador não oferece uma fonte de aleatoriedade segura
            (<code>crypto.getRandomValues</code>), então o sorteio está indisponível. Abra a página
            em um navegador atualizado, via <code>http://</code> ou <code>https://</code>.
          </p>
        ) : null}

        {mensagemDeErro !== null ? (
          <p className="aviso aviso--erro" role="alert">
            {mensagemDeErro}
          </p>
        ) : null}

        {poolInsuficiente ? (
          <p className="aviso aviso--atencao" role="status">
            Não havia participantes suficientes no arquivo para completar a lista. Todos os
            disponíveis foram sorteados.
          </p>
        ) : null}

        <PalcoSorteio
          nomeRolando={nomeRolando}
          onReiniciar={reiniciar}
          onSortear={executarSorteio}
          podeSortear={podeSortear}
          revelados={vencedoresVisiveis.length}
          status={status}
          totalParticipantes={totalParticipantes}
          totalVencedores={totalVencedores}
        />

        <PainelVencedores status={status} total={totalVencedores} visiveis={vencedoresVisiveis} />
      </main>

      <footer className="rodape">
        <ImportarJson
          desabilitado={status === 'sorteando'}
          nomeArquivo={nomeArquivo}
          onCarregar={carregarArquivo}
          onErro={setErroImportacao}
        />

        <p className="rodape__nota">
          Sorteio realizado no próprio navegador, com <code>crypto.getRandomValues</code> e
          embaralhamento Fisher-Yates. Comentários repetidos contam uma vez só.
        </p>
      </footer>
    </div>
  );
}
