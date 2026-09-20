const QUANTIDADE_PECAS = 70;

const CORES = ['#ffd166', '#ef476f', '#06d6a0', '#4cc9f0', '#f78c6b', '#c77dff'] as const;

/**
 * Posições e tempos das peças.
 *
 * Calculados a partir do índice, no carregamento do módulo, e não com números
 * aleatórios: assim a chuva não se reorganiza a cada re-render do React e não há
 * uma segunda fonte de sorteio no projeto. A variação vem dos multiplicadores
 * primos, que espalham os valores o suficiente para o olho não achar padrão.
 */
const PECAS = Array.from({ length: QUANTIDADE_PECAS }, (_, indice) => ({
  esquerda: (indice * 37) % 100,
  atrasoS: ((indice * 17) % 1200) / 1000,
  duracaoS: 2.6 + ((indice * 13) % 20) / 10,
  cor: CORES[indice % CORES.length] ?? CORES[0],
  largura: 6 + (indice % 3) * 3,
  altura: 10 + (indice % 4) * 3,
}));

/**
 * Chuva de confete comemorativa, puramente decorativa.
 *
 * Fica fora do fluxo de leitura (`aria-hidden`) e não intercepta cliques, então
 * não atrapalha quem navega por teclado ou leitor de tela.
 */
export function Confete() {
  return (
    <div aria-hidden="true" className="confete">
      {PECAS.map((peca, indice) => (
        <span
          className="confete__peca"
          key={indice}
          style={{
            left: `${peca.esquerda}%`,
            width: `${peca.largura}px`,
            height: `${peca.altura}px`,
            backgroundColor: peca.cor,
            animationDelay: `${peca.atrasoS}s`,
            animationDuration: `${peca.duracaoS}s`,
          }}
        />
      ))}
    </div>
  );
}
