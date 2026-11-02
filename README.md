# Intellecta — portfólio

Interface de uma comunidade escolar, apresentada em uma edição pública de demonstração.
O projeto demonstra organização de telas e componentes PHP, estilos responsivos e interações em JavaScript.

## O que você pode explorar

- Feed e descoberta de publicações.
- Perfis, notificações e interface de mensagens.
- Telas de preferências e configurações de conta.
- Componentes visuais, navegação e layout responsivo.

Todos os perfis e conteúdos incluídos nesta edição são fictícios. Esta versão é somente para leitura: login, cadastro, publicação, mensagens, IA e administração não acessam serviços reais nem persistem dados.

## Executar localmente

Requisito: PHP 8.2 ou superior instalado e disponível no terminal.
No Windows, extraia o ZIP inteiro e dê dois cliques em `ABRIR-PROJETO.bat`.
Ele abre o navegador e inicia o servidor local. Mantenha a janela aberta durante o uso;
para encerrar, pressione Ctrl+C ou feche a janela. Se o navegador abrir antes do servidor,
atualize a página. O arquivo avisa se o PHP não estiver instalado ou se for incompatível.

Como alternativa, use o terminal:
Na raiz deste projeto, execute:

```sh
php -S 127.0.0.1:8080 -t frontend/public frontend/router.php
```

Abra http://127.0.0.1:8080. Não é necessário configurar banco, Docker, Composer ou credenciais.
O servidor embutido é destinado à demonstração local.

## Estrutura

```text
frontend/
  assets/       # CSS, JavaScript e identidade visual
  public/       # Entrada da interface
  src/
    components/ # Componentes compartilhados
    features/   # Telas por funcionalidade
    data/       # Conteúdo fictício da demonstração
    app/        # Inicialização sem conexões externas
```

## Publicar no GitHub

1. Extraia este ZIP e use somente a pasta `intellecta-portfolio`.
2. Crie um repositório novo e envie o conteúdo dessa pasta, incluindo `.gitignore`.
3. Não misture os arquivos do pacote original com esta edição pública.

O GitHub exibe o código e este README. GitHub Pages não executa PHP; publicar o repositório não coloca esta aplicação PHP online automaticamente.

## Privacidade desta edição

Foram excluídos o backup, a estrutura e os scripts do banco, o backend privado, configurações de ambiente, credenciais, instaladores e scripts de restauração. Os dados pessoais dos exemplos foram substituídos.
A interface não possui cliente de API nem conexão em tempo real. Requisições de escrita são recusadas; uma política de conteúdo também bloqueia conexões do navegador.

Esta edição não altera nem protege automaticamente um servidor já existente. Se o pacote original já foi publicado, excluí-lo de um novo commit não apaga o histórico: troque as credenciais expostas e remova os dados do histórico antigo antes de reutilizar esse repositório.
