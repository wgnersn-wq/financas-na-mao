# 💰 Finanças na Mão

O **Finanças na Mão** é um aplicativo de controle financeiro pessoal moderno, otimizado para dispositivos móveis (Mobile-First) e configurado como **PWA (Progressive Web App)**, permitindo que seja instalado diretamente no celular como um app nativo. 

O projeto conta com controle estrito de fluxo de caixa mensal, parcelamento inteligente de lançamentos, relatórios visuais por categorias e persistência de dados blindada integrada ao **Supabase**.

---

## 🚀 Funcionalidades Principais

- **🔒 Autenticação Blindada**: Sistema de Login e Cadastro seguro via Supabase Auth com gerenciamento automático de sessão.
- **📅 Filtro de Mês Inteligente**: Navegação fluida entre meses anteriores e futuros com tratamento estrito de fuso horário local (evitando quebras de datas UTC).
- **📊 Dashboard Dinâmico**: 
  - Exibição de Saldo Geral, total de Entradas e total de Saídas do mês filtrado.
  - **Alerta de Saldo Vermelho Vinho**: O card principal muda de cor dinamicamente para um tom de aviso escuro com um ícone piscante caso o saldo fique negativo.
- **🔄 Lançamento e Parcelamento Automático**:
  - Máscara de moeda em tempo real (`R$ 0,00`) no formulário.
  - Projeção de parcelas antes da confirmação.
  - Geração automática de parcelas em lote com cálculo de distribuição de meses consecutivos direto no banco de dados.
- **✨ Feedback de Sucesso Animado**: Janela flutuante integrada ao formulário com animação e feedback visual instantâneo após a gravação de dados.
- **📈 Relatório de Distribuição Mensal**: Aba exclusiva com gráfico de barras de progresso que calcula o percentual de impacto financeiro de cada categoria nas saídas do mês.
- **🗑️ Gerenciamento de Histórico**: Listagem de transações agrupada por data com exclusão rápida via modal de confirmação limpo.
- **📱 PWA (Progressive Web App)**: Pronto para instalação na tela inicial do smartphone, com suporte offline e comportamento idêntico a um aplicativo nativo.

---

## 🛠️ Tecnologias Utilizadas

- **Framework:** [Next.js](https://nextjs.org/) (React) com arquitetura App Router.
- **Estilização:** [Tailwind CSS](https://tailwindcss.com/) com animações nativas.
- **Banco de Dados & Auth:** [Supabase](https://supabase.com/) (PostgreSQL).
- **Ícones:** [Lucide React](https://lucide.dev/).
- **Formatação:** `Intl.NumberFormat` para moeda local (pt-BR).

---

## 📂 Estrutura do Projeto

src/
├── app/
│   ├── globals.css      # Estilos globais e reset do Tailwind
│   ├── layout.tsx       # Estrutura HTML principal do app
│   └── page.tsx         # Cérebro do App (Estado global, abas e lógica de auth)
├── components/
│   ├── MonthFilter.tsx     # Filtro de meses (Avançar / Voltar)
│   ├── TransactionForm.tsx # Formulário, máscara, parcelamento e animação de sucesso
│   └── TransactionList.tsx # Listagem por dias e modal de deleção rápida
└── lib/
    └── supabase.ts      # Cliente de conexão blindada com o Supabase

⚡ Como Rodar o Projeto Localmente
1. Clonar o Repositório
- git clone [https://github.com/seu-usuario/financas-na-mao.git](https://github.com/seu-usuario/financas-na-mao.git)
cd financas-na-mao

2. Instalar as Dependências
npm install
# ou
yarn install

3. Configurar as Variáveis de Ambiente
Crie um arquivo chamado .env.local na raiz do projeto e insira as suas chaves do Supabase:
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase

4. Iniciar o Servidor de Desenvolvimento
npm run dev
# ou
yarn dev

Abra http://localhost:3000 no seu navegador para testar. (Dica: Ative o modo de inspeção de dispositivo móvel F12 para testar a experiência mobile ideal).

🚀 Como Atualizar o Servidor / Produção (Deploy)
Sempre que fizer alterações no código local e quiser que elas reflitam no seu PWA instalado ou no site publicado na Vercel, execute os seguintes comandos no terminal:
# 1. Adiciona todas as modificações
git add .

# 2. Registra a mensagem das melhorias feitas
git commit -m "feat: integracao de abas, relatorios, sucesso animado e alerta de saldo"

# 3. Envia para o repositório remoto (Dispara o deploy automático na Vercel)
git push

Nota para o PWA no celular: O smartphone tende a armazenar o cache do código anterior para economizar dados. Após o término do deploy, feche completamente o aplicativo no celular, abra-o novamente conectado à internet e arraste a tela para baixo para forçar a atualização dos novos recursos.

📝 Licença
Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

Developed with 💚 for personal financial organization.
