/**
 * Orquestração do sorteio na interface.
 *
 * Duas decisões sustentam este arquivo:
 *
 * 1. O sorteio é uma única operação atômica. Toda a lista de ganhadores é
 *    decidida no instante do clique, e a "animação" apenas revela uma lista que
 *    já está fechada. Nada é sorteado durante a contagem, então o suspense é
 *    apresentação, não regra. Se fosse o contrário, interromper a animação
 *    poderia alterar o resultado.
 *
 * 2. Os nomes fixos e os tirados do JSON são embaralhados juntos antes de
 *    aparecer. Só concatenar as duas listas faria os fixos caírem sempre nas
 *    mesmas posições, na ordem do arquivo, e a origem de cada nome ficaria
 *    evidente para quem assiste. Embaralhar o conjunto é o que torna as duas
 *    procedências indistinguíveis na tela.
 *
 * A regra de quem pode ganhar não vive aqui: ela está em `lib/`, que este hook
 * apenas compõe.
 */

import { useCallback, useEffect, useMemo, useReducer } from 'react';

import { embaralhar } from '../lib/aleatorio';
import { INTERVALO_REVELACAO_MS } from '../lib/config';
import { sortear } from '../lib/sorteio';
import type { StatusSorteio } from '../lib/tipos';

interface Estado {
  readonly status: StatusSorteio;
  readonly vencedores: readonly string[];
  readonly revelados: number;
  readonly erro: string | null;
  readonly totalCandidatos: number;
  readonly poolInsuficiente: boolean;
}

type Acao =
  | {
      readonly tipo: 'iniciar';
      readonly vencedores: readonly string[];
      readonly totalCandidatos: number;
      readonly poolInsuficiente: boolean;
    }
  | { readonly tipo: 'revelar' }
  | { readonly tipo: 'falhar'; readonly mensagem: string }
  | { readonly tipo: 'reiniciar' };

const ESTADO_INICIAL: Estado = {
  status: 'ocioso',
  vencedores: [],
  revelados: 0,
  erro: null,
  totalCandidatos: 0,
  poolInsuficiente: false,
};

function redutor(estado: Estado, acao: Acao): Estado {
  switch (acao.tipo) {
    case 'iniciar':
      return {
        status: acao.vencedores.length === 0 ? 'concluido' : 'sorteando',
        vencedores: acao.vencedores,
        revelados: 0,
        erro: null,
        totalCandidatos: acao.totalCandidatos,
        poolInsuficiente: acao.poolInsuficiente,
      };

    case 'revelar': {
      if (estado.status !== 'sorteando') {
        return estado;
      }
      const revelados = Math.min(estado.revelados + 1, estado.vencedores.length);
      return {
        ...estado,
        revelados,
        status: revelados >= estado.vencedores.length ? 'concluido' : 'sorteando',
      };
    }

    case 'falhar':
      return { ...ESTADO_INICIAL, erro: acao.mensagem };

    case 'reiniciar':
      return ESTADO_INICIAL;

    default:
      return estado;
  }
}

function mensagemDeErro(erro: unknown): string {
  return erro instanceof Error ? erro.message : 'Falha inesperada ao realizar o sorteio.';
}

export interface ParametrosUseSorteio {
  /** Pool de candidatos vindo do JSON de comentários. */
  readonly candidatos: readonly string[];
  /** Nomes que entram na lista final sem passar pelo sorteio. */
  readonly fixos: readonly string[];
  /** Quantos nomes tirar do pool de candidatos. */
  readonly quantidade: number;
  /** Intervalo entre revelações, em ms. */
  readonly intervaloMs?: number;
}

export interface RetornoUseSorteio {
  readonly status: StatusSorteio;
  /** Lista final embaralhada, inclusive os nomes ainda não revelados. */
  readonly vencedores: readonly string[];
  /** Apenas os nomes já revelados na tela. */
  readonly vencedoresVisiveis: readonly string[];
  /** Quantos nomes a lista final terá quando o sorteio rodar. */
  readonly totalVencedores: number;
  readonly erro: string | null;
  readonly totalCandidatos: number;
  readonly poolInsuficiente: boolean;
  readonly emAndamento: boolean;
  readonly concluido: boolean;
  readonly executarSorteio: () => void;
  readonly reiniciar: () => void;
}

export function useSorteio({
  candidatos,
  fixos,
  quantidade,
  intervaloMs = INTERVALO_REVELACAO_MS,
}: ParametrosUseSorteio): RetornoUseSorteio {
  const [estado, despachar] = useReducer(redutor, ESTADO_INICIAL);

  const executarSorteio = useCallback(() => {
    try {
      const resultado = sortear(candidatos, quantidade);

      // Um segundo embaralhamento, agora sobre o conjunto completo. O primeiro
      // decidiu quem ganha; este decide apenas a ordem em que os nomes surgem.
      const listaFinal = embaralhar([...fixos, ...resultado.sorteados]);

      despachar({
        tipo: 'iniciar',
        vencedores: listaFinal,
        totalCandidatos: resultado.totalCandidatos,
        poolInsuficiente: resultado.poolInsuficiente,
      });
    } catch (erro) {
      despachar({ tipo: 'falhar', mensagem: mensagemDeErro(erro) });
    }
  }, [candidatos, fixos, quantidade]);

  const reiniciar = useCallback(() => {
    despachar({ tipo: 'reiniciar' });
  }, []);

  // Agenda a próxima revelação. O efeito para sozinho quando o redutor muda o
  // status para 'concluido', e o clearTimeout evita que um temporizador
  // pendente dispare depois de um reinício ou da desmontagem.
  useEffect(() => {
    if (estado.status !== 'sorteando') {
      return;
    }

    const temporizador = window.setTimeout(() => {
      despachar({ tipo: 'revelar' });
    }, intervaloMs);

    return () => {
      window.clearTimeout(temporizador);
    };
  }, [estado.status, estado.revelados, intervaloMs]);

  const vencedoresVisiveis = useMemo(
    () => estado.vencedores.slice(0, estado.revelados),
    [estado.vencedores, estado.revelados],
  );

  return {
    status: estado.status,
    vencedores: estado.vencedores,
    vencedoresVisiveis,
    totalVencedores: fixos.length + quantidade,
    erro: estado.erro,
    totalCandidatos: estado.totalCandidatos,
    poolInsuficiente: estado.poolInsuficiente,
    emAndamento: estado.status === 'sorteando',
    concluido: estado.status === 'concluido',
    executarSorteio,
    reiniciar,
  };
}
