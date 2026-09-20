import type { ChangeEvent } from 'react';

export interface PropsImportarJson {
  /** Nome do arquivo em uso, ou null quando é o JSON embutido no projeto. */
  readonly nomeArquivo: string | null;
  readonly desabilitado: boolean;
  readonly onCarregar: (dados: unknown, nomeArquivo: string) => void;
  readonly onErro: (mensagem: string) => void;
}

/**
 * Troca o arquivo de participantes sem precisar rebuildar o projeto.
 *
 * Fica no rodapé de propósito: é controle de operação, não parte do espetáculo.
 * O arquivo é lido no próprio navegador e nunca sai da máquina — não há upload,
 * servidor nem requisição de rede envolvida.
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
    <div className="fonte">
      <label className="fonte__rotulo" htmlFor="arquivo-participantes">
        Arquivo de participantes
      </label>

      <input
        accept="application/json,.json"
        className="fonte__campo"
        disabled={desabilitado}
        id="arquivo-participantes"
        onChange={(evento) => {
          void processarArquivo(evento);
        }}
        type="file"
      />

      <p className="fonte__ajuda">
        {nomeArquivo === null
          ? 'Usando o arquivo de exemplo do projeto.'
          : `Em uso: ${nomeArquivo}`}{' '}
        Processado no navegador, sem envio para servidor.
      </p>
    </div>
  );
}
