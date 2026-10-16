# Ergastério

Home para reunir os experimentos do servidor e os repositórios públicos do GitHub. Interface clara com navegação lateral, ilustração original, busca por temas, cartões e lista. React + Vite no desenvolvimento; PHP 7.4+ para descobrir as pastas na hospedagem.

**O `index.html` da raiz já está compilado**, com aplicação, estilos, fontes e ícone incorporados. Ele abre sem Node.js ou pasta `assets`. O template editável é `development.html`; o Vite o utiliza automaticamente.

## Publicar na Superdomínios pelo cPanel

Como você usa **Code → Download ZIP**, extraia o download e abra a pasta `ergasterioHome-main`. Envie estes **três arquivos de dentro dela** para a raiz do domínio, normalmente `public_html`:

```text
public_html/
├── index.html                 ← substituir pela nova Home compilada
├── projects.php               ← índice automático das pastas
├── ergasterio-projects.json    ← nomes, descrições e vínculos com GitHub
├── andante/                   ← preservar os projetos existentes
├── celulas/
├── correria/
├── dashboard/
├── fusca_engine_demo/
└── ...
```

1. Guarde uma cópia dos três arquivos atuais antes de substituí-los.
2. Substitua os três arquivos **diretamente na raiz do domínio**, ao lado das pastas dos projetos. Deixar a Home somente dentro de `ergasterioHome-main/` não atualiza a página principal.
3. Use permissões `0644` para arquivos e `0755` para pastas. Preserve as pastas dos experimentos e suas regras de acesso.
4. Abra `https://ergasterio.com.br/projects.php`. A resposta deve ser um JSON com `schemaVersion`, `scannedAt` e `projects`.
5. Abra `https://ergasterio.com.br/?v=home-clara`. O painel deve indicar **Índice atualizado**. Se aparecer **Catálogo disponível**, o catálogo inicial funciona, mas a leitura automática das pastas ainda não foi conectada.

O pacote `artifacts/ergasterio-superdominios.zip`, gerado por `npm run package:hosting`, contém esses arquivos e o catálogo auxiliar. No GitHub Actions, o workflow **Gerar pacote para Superdomínios** também disponibiliza os arquivos de publicação em **Artifacts → ergasterio-superdominios**.

Só trocar o `index.html` atualiza o visual e o catálogo inicial. **A descoberta de futuras pastas exige também `projects.php`, PHP habilitado e o arquivo de configuração ao lado da Home.** Não é necessário Node.js, banco de dados ou cron no cPanel.

Se o domínio continuar mostrando o HTML antigo, confira a pasta raiz configurada para o domínio no cPanel e se algum `index.php` anterior está sendo servido antes de `index.html`. Uma resposta HTTP 500 em `projects.php` exige consultar o log de erros PHP/Apache da hospedagem. Esta implementação não altera o `.htaccess` nem corrige os builds internos das experiências existentes.

## Como novas pastas entram automaticamente

O índice lê somente as pastas vizinhas à Home. Uma pasta nova entra quando contém `index.html`, `index.htm`, `index.php`, `app.html`, `demo.html` ou `main.html`. A Home consulta o índice ao abrir, ao voltar à aba e a cada 90 segundos com a aba visível. O botão de atualização faz uma nova consulta imediatamente.

Para refinar o nome, descrição ou endereço de entrada, coloque um manifesto **`ergasterio.project.json` dentro da pasta do projeto**:

```json
{
  "public": true,
  "name": "Meu novo laboratório",
  "description": "Uma experiência para explorar ideias e descobrir relações.",
  "category": "Ciência",
  "entry": "demo.html",
  "repository": "nome-do-repositorio",
  "featured": true
}
```

`repository` recebe apenas o nome de um repositório público do proprietário configurado. Os temas são `Ciência`, `Arte & criação`, `Engenharia`, `Jogos`, `Tecnologia` e `Sociedade`. Sem manifesto, nome e tema recebem valores iniciais automáticos. Use `public: false` para ocultar um projeto. `public: true` também permite exibir um cartão em preparação, sem um botão de acesso, enquanto a entrada não existe.

Pastas ocultas, symlinks, configurações, dependências, uploads, backups e cópias da Home ficam de fora. A lista adicional de exclusões fica em `ergasterio-projects.json`. O endpoint não recebe caminhos pela URL, não escreve arquivos, não executa projetos nem expõe caminhos absolutos do servidor. Não coloque uma entrada pública em diretórios que precisam permanecer privados.

As **17 pastas de projetos visíveis na imagem fornecida** já têm nomes, temas e descrições. As versões de JetStream, Mecanismo e Sonic permanecem separadas. `.github`, `.well-known`, `config`, `public`, `scripts` e os downloads `ergasterioHome-*` são arquivos de suporte, não projetos da vitrine.

`nuvens` aparece em preparação porque a verificação pública encontrou uma listagem de arquivos, sem uma entrada executável na raiz. Depois de publicar a aplicação nessa pasta, remova `preparing: true` de seu mapeamento. Outros projetos podem depender de correções próprias: a existência de uma entrada permite indexá-la, mas não comprova que sua aplicação está funcionando.

## Alinhamento com o GitHub

A Home combina o índice do servidor com o catálogo público de `aquinomartins`. Associa nomes equivalentes ou usa o vínculo explícito no manifesto/configuração. Quando encontra o mesmo projeto nas duas fontes, mostra o acesso do servidor e o link ao código no mesmo cartão. Versões locais diferentes são preservadas.

Os mapeamentos iniciais incluem `dashboard → bachianash`, `ergasterio → ergasteriux`, `mecanismo/mecanismo114 → mecanismo-n-114` e `nuvens → Nuvens-Holandesas`. A pasta `celulas` não foi associada por suposição a um dos vários repositórios de células.

**Relacionar o repositório não faz deploy nem sobrescreve pastas.** Cada experiência continua com seu processo de publicação. Este projeto não tem acesso autenticado ao cPanel para sincronizar arquivos de outras aplicações.

```sh
npm run sync
```

O script descobre todos os repositórios públicos, com paginação, usando a API oficial ou as páginas públicas do GitHub como alternativa. Repositórios privados, arquivados e excluídos pela curadoria ficam de fora. A saída é `public/data/repositories.json`; erros preservam a versão anterior. Edite `config/catalog.json` para configurar temas, objetivos, destaques e endereços públicos reais. Forks mantêm links à autoria e à licença de origem.

O workflow `.github/workflows/sync-catalog.yml` atualiza esse catálogo diariamente às 06:17 UTC e permite execução manual. Precisa estar habilitado na branch padrão, com permissão de escrita. O feed público configurado em `catalogFeed` transmite as atualizações à Home publicada. O GitHub pode atrasar agendamentos e a distribuição do feed. Mudanças no design exigem novo build/publicação.

## Executar e validar

Requer Node.js 24.5+ e PHP 7.4+ para os testes do índice. O desenvolvimento visual não depende de PHP e usa o catálogo inicial quando o endpoint está indisponível.

```sh
npm ci --cache /tmp/ergasterio-npm
npm run dev -- --port 5173
npm test                 # catálogo, vínculos, PHP e descoberta por HTTP
npm run test:e2e         # navegação, celular, descoberta, radar e acessibilidade
npm run build            # dist/, incluindo o índice PHP e a configuração
npm run package:hosting  # HTML independente + ZIP, atualiza index.html da raiz
npm run test:hosting     # testa o HTML gerado com assets externos bloqueados
npm run test:root        # testa o index.html versionado, servido sem Vite
```

Os testes PHP usam `php` no PATH ou o executável indicado em `PHP_BIN`. No ambiente atual da nuvem, o runtime isolado está em `/workspace/shared/php-runtime/php`, detectado automaticamente pelos testes. Nenhuma configuração PHP do sistema foi alterada. Os testes de navegador usam `/usr/bin/chromium`; informe `CHROMIUM_PATH` se necessário.

Para testar o pacote completo com descoberta de pastas:

```sh
php -S 127.0.0.1:8080 -t dist-hosting
```

Coloque pastas de demonstração em `dist-hosting/` e abra o endereço local. Não use `vite preview` para validar PHP: ele serve apenas arquivos estáticos. O scanner deve executar no servidor PHP.

Edite `src/` e `development.html`, depois rode `npm run package:hosting` e inclua o `index.html` regenerado no commit. Ele é saída gerada, não deve ser editado manualmente. O build padrão separa CSS/JS em `assets/`; publique todo o conteúdo de `dist/` se escolher essa variante.

Para um subdiretório, use `npm run build -- --base=/seu-subdiretorio/`. A descoberta considera as pastas ao lado da Home nesse subdiretório; para os projetos mostrados na imagem, publique a Home na raiz do domínio.

## Experiência e formações

- Busca por nome, tema e descrição, sem distinção de acentos; filtro por origem e tema; cartões ou lista.
- Radar e progresso das trilhas salvos neste navegador, sem cadastro.
- Destaques variáveis a cada dia, “Outro olhar” e “Me surpreenda”; catálogo completo com ordem estável por padrão.
- Trilhas autoguiadas e laboratório interativo de figuras de Lissajous.
- Catálogo inicial embutido para manter a interface acessível quando PHP ou rede falham.
- Fontes locais, navegação por teclado, diálogos nativos e respeito a movimento reduzido.

As formações em `config/products.json` estão em desenvolvimento. O lembrete é local, não uma inscrição nem lista de e-mails. A Home só exibe compra quando o produto tem `status: "available"`, preço válido em `priceInCents`, moeda e um `checkoutUrl` HTTPS real. Pagamento, matrícula e entrega pertencem à plataforma de checkout/ensino escolhida. Não coloque chaves privadas no frontend.

## Estrutura

```text
index.html                       Home compilada para publicação direta
projects.php                     Índice das pastas do servidor
ergasterio-projects.json          Metadados, vínculos e exclusões das pastas
development.html                 Template de desenvolvimento
config/                          Curadoria GitHub e produtos
public/data/repositories.json    Catálogo GitHub gerado
scripts/                         Sincronização e empacotamento
src/App.jsx                      Interface, navegação e experiências
src/hooks/useProjectCatalog.js   Consulta periódica e união dos catálogos
src/lib/server-catalog.mjs       Vínculos e validação do índice
src/components/                  Ilustração, diálogos e laboratório
src/styles.css                   Visual claro e responsividade
tests/                           PHP/HTTP, dados e navegador
.github/workflows/               Atualização do catálogo e pacote cPanel
```

Use o checkout existente nas tarefas da nuvem; cada tarefa já é isolada. Não crie um Git worktree sem solicitação explícita. Esta alteração não publica arquivos no domínio automaticamente.
