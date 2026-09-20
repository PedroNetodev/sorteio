/**
 * Parâmetros do sorteio.
 *
 * Tudo que é regra de negócio ajustável mora aqui, para não ficar espalhado
 * por componentes. Mudar a quantidade de sorteados ou a velocidade da
 * revelação é alterar uma linha deste arquivo.
 */

/** Quantos nomes serão sorteados a partir do JSON de comentários. */
export const QUANTIDADE_SORTEADOS = 5;

/**
 * Intervalo entre a revelação de um ganhador e o próximo, em milissegundos.
 *
 * A lista final tem 15 nomes, então valores altos deixam a exibição arrastada:
 * 600 ms fecha o sorteio em torno de 9 segundos.
 */
export const INTERVALO_REVELACAO_MS = 600;

/**
 * Remove o autor da publicação do pool de candidatos.
 *
 * O campo `sourceUsername` dos comentários identifica o perfil que publicou.
 * Quem promove o sorteio não deve concorrer nele, então o padrão é excluir.
 */
export const EXCLUIR_AUTOR_DA_PUBLICACAO = true;

/**
 * Usernames que nunca podem ser sorteados, além dos pré-selecionados.
 *
 * Útil para perfis de equipe, bots ou participantes desclassificados.
 * A comparação ignora maiúsculas/minúsculas e um eventual "@" no início.
 */
export const USUARIOS_BLOQUEADOS: readonly string[] = [];
