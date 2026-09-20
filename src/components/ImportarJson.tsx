import type { ChangeEvent } from 'react';

export interface PropsImportarJson {
  /** Nome do arquivo em uso, ou null quando é o JSON embutido no projeto. */
  readonly nomeArquivo: string | null;
  readonly desabilitado: boolean;
  readonly onCarregar: (dados: unknown, nomeArquivo: string) => void;
  readonly onErro: (mensagem: string) => void;
}

/**
 * Troca o JSON de comentários sem precisar rebuildar o projeto.
 *
 * O arquivo é lido no próprio navegador e nunca sai da máquina: não há upload,
 * servidor nem requisição de rede envolvida. Cada sorteio novo costuma ter uma
 * exportação de comentários diferente, e sem isso seria preciso editar o código
 * fonte a cada rodada.
 */
export function ImportarJson({
  nomeArquivo,
  desabilitado,
  onCarregar,
  onErro,
}: PropsImportarJson) {
  async function processarArquivo(evento: ChangeEvent<HTMLInputElement>): Promise<void> {
    const arquivo = evento.target.files?.[0];

    // Limpa a seleção para que escolher o mesmo arquivo de novo volte a disparar.
    evento.target.value = '';

    if (!arquivo) {
      return;
    }

    try {
      const texto = await arquivo.text();
      const dados: unknown = JSON.parse(texto);
      onCarregar(dados, arquivo.name);
    } catch (erro) {
      const detalhe = erro instanceof Error ? erro.message : 'formato não reconhecido';
      onErro(`Não foi possível ler "${arquivo.name}": ${detalhe}`);
    }
  }

  return (
    <div className="importar">
      <label className="importar__rotulo" htmlFor="arquivo-comentarios">
        Arquivo de comentários
      </label>

      <input
        accept="application/json,.json"
        className="importar__campo"
        disabled={desabilitado}
        id="arquivo-comentarios"
        onChange={(evento) => {
          void processarArquivo(evento);
        }}
        type="file"
      />

      <p className="importar__ajuda">
        {nomeArquivo === null
          ? 'Usando o comentarios.json de exemplo do projeto. Selecione um arquivo para trocar.'
          : `Em uso: ${nomeArquivo}`}{' '}
        O arquivo é processado no navegador e não é enviado para nenhum servidor.
      </p>
    </div>
  );
}
