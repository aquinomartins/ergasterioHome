# Ergastério

Uma Home editorial para conectar arte, ciência, tecnologia e educação. Construída em React, Vite e Three.js; o resultado de produção é um site estático, sem necessidade de servidor Node na hospedagem.

## Executar

Requer Node.js 24.5 ou mais recente. O ambiente da nuvem já fornece Node 24.

```sh
cd /workspace/ergasterioHome
npm ci --cache /tmp/ergasterio-npm
npm run dev -- --port 5173
```

O cache em `/tmp` evita depender de permissões de escrita no diretório pessoal do ambiente. Em uma máquina própria, `npm ci` também funciona.

```sh
npm test          # descoberta, curadoria, busca, links e contrato de compra
npm run test:e2e  # navegação real, celular, radar, trilhas, laboratório e acessibilidade
npm run build    # gera dist/
npm run preview -- --port 4173
```

Os testes de navegador usam `/usr/bin/chromium`. Para outra instalação, informe `CHROMIUM_PATH`. Em CI, instale Chromium/Playwright antes de executar a suíte de navegador.

## O que está implementado

- Composição visual original, ilustrações vetoriais e escultura 3D; fontes incluídas no projeto.
- Catálogo por temas, busca sem distinção de acentos e páginas de detalhes em diálogos acessíveis.
- Radar e progresso local, sem cadastro, rastreamento, envio de e-mail ou serviço externo de armazenamento.
- Trilhas abertas e autoguiadas, com atividades e fontes dos projetos.
- Laboratório de figuras de Lissajous: duas frequências controláveis demonstram relações entre matemática, arte e música.
- Destaques com ordem variável a cada dia, pergunta diária e botões “Outro olhar” e “Me surpreenda”. A navegação permanece estável enquanto a pessoa explora.
- Conteúdo disponível mesmo quando a atualização do catálogo falha. O componente 3D possui alternativa vetorial e respeita a preferência por movimento reduzido.
- Estrutura para ofertas com preços e checkout externos, sem criar ofertas ou resultados comerciais fictícios.

## Descoberta automática de repositórios

```sh
npm run sync
```

O script consulta todos os repositórios públicos de `aquinomartins`, com paginação. Primeiro usa a API oficial do GitHub. Se ela estiver indisponível, consulta as páginas públicas oficiais. No ambiente da nuvem, o acesso à API está bloqueado e a alternativa pública foi validada. TLS e certificados permanecem verificados.

O catálogo gerado fica em `public/data/repositories.json`. A sincronização usa gravação atômica e falha sem apagar o catálogo anterior quando encontra erro de rede, formato inesperado ou listagem vazia. O navegador recebe uma cópia inicial embutida, consulta o JSON local e, na versão de produção, tenta buscar o feed público configurado em `catalogFeed`. Não consulta a API do GitHub diretamente, não envia credenciais nem o endereço de origem ao feed, e mantém o catálogo disponível se a rede falhar. No desenvolvimento, usa apenas a versão local.

Novos repositórios públicos entram automaticamente. Repositórios privados e arquivados ficam de fora. A categoria inicial é inferida pelo nome, descrição e tópicos; essa classificação é uma sugestão e pode ser refinada editorialmente.

Edite `config/catalog.json` para:

- Alterar `owner`.
- Excluir projetos em `excluded`. A seleção inicial remove infraestrutura, backups, projetos imobiliários e exercícios antigos para manter o contexto educacional.
- Definir nome, chamada, descrição, categoria, tags e objetivos em `projects`.
- Marcar `featured: true` para os destaques.
- Informar `homepage` com o endereço público real da experiência. Sem esse endereço, o botão identifica e abre o repositório; não inventa uma demonstração.
- Informar o tipo de ilustração em `art`: `anatomy`, `cell`, `art`, `sound`, `code` ou `network`.

Depois de editar, execute `npm run sync` e `npm run build`. Forks mantêm um aviso de adaptação e um link para consultar autoria e licença no repositório.

### Atualização diária

`.github/workflows/sync-catalog.yml` contém a rotina diária e o acionamento manual pelo GitHub Actions. Ela consulta os projetos, atualiza o JSON e cria um commit quando necessário, utilizando o token temporário nativo do GitHub.

A rotina só começa depois que este código estiver publicado na branch padrão e o workflow estiver habilitado. A configuração do repositório precisa permitir escrita para o workflow. O agendamento está definido para 06:17 UTC, aproximadamente 03:17 em São Paulo; o GitHub pode atrasar execuções agendadas.

Depois da primeira publicação da Home, o feed padrão em `raw.githubusercontent.com/aquinomartins/ergasterioHome/main/public/data/repositories.json` permite receber novos projetos automaticamente, inclusive em hospedagem compartilhada, sem reenviar o site inteiro. O workflow precisa estar ativo e o repositório e esse arquivo devem ser públicos na branch `main`; a distribuição do GitHub pode levar alguns minutos. Ajuste `catalogFeed` se mudar o repositório ou a branch.

Se preferir desativar consultas externas, defina `catalogFeed` como `null`. Nesse caso, a hospedagem precisa reconstruir/publicar o site após os commits de sincronização, ou receber manualmente o novo `dist/`. Alterações no design ou na configuração de produtos sempre exigem novo build e publicação. O workflow não envia arquivos diretamente ao servidor do domínio.

## Ativar produtos educacionais

As duas formações iniciais estão explicitamente em desenvolvimento. O interesse é apenas um marcador local, não uma inscrição nem uma lista de e-mails.

Os produtos estão em `config/products.json`. Para uma oferta real, defina:

```json
{
  "id": "id-da-formacao",
  "category": "CIÊNCIA",
  "title": "Título real da formação",
  "description": "Descrição do programa que será entregue.",
  "status": "available",
  "priceInCents": 19900,
  "currency": "BRL",
  "checkoutUrl": "https://endereco-real-do-seu-checkout"
}
```

O valor acima é apenas um exemplo de configuração, não uma oferta exibida. A Home só mostra preço e compra quando a oferta está disponível, o preço é válido e o checkout usa HTTPS. Podem ser usados links de plataformas de pagamento como Hotmart, Stripe ou outra solução já configurada pelo responsável. Não coloque chaves privadas no frontend.

Pagamento, confirmação, acesso ao curso, regras comerciais e entrega devem estar implementados no serviço de checkout/ensino escolhido. Esta Home não simula cobrança, matrícula ou envio de notificações.

## Publicação

### Superdomínios / cPanel

Para reduzir falhas de envio, referências a arquivos ausentes e conflitos com a pasta `assets` do site antigo, use o pacote com JavaScript, estilos e fontes incorporados ao HTML:

```sh
npm run package:hosting
```

O comando gera `artifacts/ergasterio-superdominios.zip`. Extraia seu conteúdo diretamente na pasta raiz do domínio no cPanel, depois de guardar uma cópia do `index.html` atual fora da pasta pública. A estrutura é `index.html`, `favicon.svg` e `data/repositories.json`. O ZIP define permissões 0644 para arquivos e 0755 para pastas.

Esse `index.html` pode renderizar toda a Home mesmo quando a pasta `assets` está ausente. O catálogo inicial está embutido; o JSON local e o feed remoto continuam sendo usados para atualizar os projetos quando disponíveis. O pacote incorpora também o componente 3D e as fontes, aumentando o tamanho do HTML em troca de simplificar a publicação. O build padrão mantém os arquivos separados para hospedagens com deploy automatizado.

O `index.html` da **raiz do repositório** é uma entrada de desenvolvimento e depende do Vite. Enviar esse arquivo diretamente para a hospedagem pode produzir uma página branca. Use o HTML gerado pelo comando de publicação ou o ZIP do workflow.

O workflow **Gerar pacote para Superdomínios** executa após pushes para `main`, em pull requests e por acionamento manual. No GitHub, abra **Actions → Gerar pacote para Superdomínios → execução concluída → Artifacts → ergasterio-superdominios**. O download já contém os arquivos publicados na raiz do ZIP. Extraia o pacote gerado; não use **Code → Download ZIP**, que baixa o código-fonte.

```sh
npm run test:hosting
```

Essa verificação abre o build de hospedagem no navegador, bloqueia arquivos externos de script, estilo e fonte, e valida a renderização, busca, radar, laboratório e uso em celular sem atualização do catálogo.

Se uma publicação continuar branca, abra os endereços de JS e CSS indicados no HTML e confira a resposta: 404 indica arquivo ausente; 403 pode indicar permissões ou regras de acesso; uma resposta HTML em lugar de JS/CSS pode indicar redirecionamento ou reescrita no `.htaccess`. Preserve as regras necessárias aos experimentos existentes e confira eventuais políticas de bloqueio de scripts do servidor antes de alterá-las.

### Build com arquivos separados

Execute `npm run build` e publique **o conteúdo de `dist/`**, incluindo `assets/`, `data/` e `favicon.svg`, na raiz desejada do site. A navegação usa âncoras e não exige regras de fallback de SPA.

Para um subdiretório:

```sh
npm run build -- --base=/seu-subdiretorio/
```

O projeto não foi publicado em `ergasterio.com.br` durante esta implementação. O domínio e sua hospedagem permanecem sob a administração do proprietário.

## Estrutura

```text
config/                     Curadoria de projetos e ofertas
public/data/                Catálogo público gerado
scripts/sync-repositories.mjs Descoberta e sincronização
src/App.jsx                 Home, catálogo, trilhas e diálogos
src/components/             Arte, escultura 3D e laboratório
src/lib/                    Classificação, busca, variação e compra
src/styles.css              Sistema visual e responsividade
src/experiences.css          Laboratório e ajustes editoriais
tests/                      Verificação funcional e de dados
.github/workflows/          Atualização diária do catálogo
```

Use o checkout existente nas tarefas da nuvem; cada tarefa já é isolada. Não crie um Git worktree sem solicitação explícita.
