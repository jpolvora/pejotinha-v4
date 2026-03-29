SAAS Pejotinha - Gerenciamnento de Clientes, Projetos, Atividades, Proof Of Work para Freelancers

    UI Moderna, Tema dark e light
    3 paletas de cores (laranja, azul, roxo)

    Padrão: Tela divida em Menu lateral esquerdo (colapsável), barra de menus no topo (lado direito: icone do usuario, foto, nome, configurações) e área principal.
    Os menus (exceto dashboard) sempre ativam uma tela que é a listagem com cards. Cada linha/card possui botões e links para editar/excluir/ver registros filhos relacionados (navegação)

    Stack: Next.js, typescript, supabase local (self-hosted)
    utilizar ultima versao de pacotes, skills com melhores praticas para linguagens e freameworks
    buid e desenvolvimento local com debug
    deploy via docker container (coolify)

Briefing de features

* Cadastro e Login do Usuário
    - Usuário da plataforma por default é um freelancer
    - todo usuário é um possível cliente de outro usuário: Relacionar clientes e freelancers
    * Cadastro de Clientes (supervisiona projetos, outro usuário da plataforma, via convite ou já existente)
        * Cadastro de projetos:
            * Cadastro de Atividades Executadas: Data e Hora inicial e final, tempo de trabalho, especificação, prompt/user story/plano de execução
                * Cadastro de evidências: Múltiplos itens de diversos tipos: Imagens, vídeos, prints, links com descrição, número do ticket, sprint
                * Aprovação: Cliente aprova, desaprova ou pede mais evidências
        * Relatórios
            -  Resumo de atividades por projeto
            -  Cobrança mensal (fatura para o cliente)

Menus: 
Dashboard
    * Gráfico de produtividade
    * Tarefas executadas por dia nos últimos 7 dias
Gestão de Clientes e Projetos
Timeline
Relatórios


Workflow:
    Usuário da plataforma (freelancer) se registra e faz login.
    Cadastra clientes (nome da empresa cnpj, email, valor Hora)
    Lista os clientes cadastrados (cards, listas com links de editar/ativar/desativar/excluir)
    Adiciona projetos para o cliente (nome, stack, links repositórios, readme/descrição/observação, status ativo, concluido, inativo)
    Lista projetos do cliente (com link para a pagina do projeto)
    Na página do projeto, lista as atividades executadas
    Registra novas atividades

    Convida o cliente (email) para visualizar as atividades do freelancer
    Cliente se cadastra na plataforma, faz login e acessa área do cliente
    Cliente visualiza projetos em que foi convidado para ser cliente de outro usuário freelancer
    

    
