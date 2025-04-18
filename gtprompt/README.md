# GTA-Style Prompt Wheel

Uma aplicação inspirada na roda de seleção de armas do GTA5 para gerenciar e utilizar prompts de IA de forma rápida e intuitiva.

## Recursos Implementados na Fase 1

- Interface visual semelhante à roda de armas do GTA5
- Ativação por atalho de teclado (Alt+Shift+')
- Seleção de prompts com o mouse
- Sistema de categorias para organizar prompts
- Copiar prompts para a área de transferência

## Tecnologias

- **Frontend**: React com TypeScript
- **Estilização**: TailwindCSS
- **Animação**: Framer Motion
- **Backend**: Tauri (Rust)

## Estrutura do Projeto

```
gtprompt/
├── src/                     # Código frontend React
│   ├── components/
│   │   └── wheel/
│   │       └── WheelComponent.tsx    # Componente principal da roda
│   ├── hooks/
│   │   └── usePrompts.ts    # Hook para gerenciar prompts
│   ├── services/
│   │   └── clipboardService.ts    # Serviço para interação com clipboard
│   ├── App.tsx              # Componente principal
│   └── main.tsx             # Ponto de entrada
│
├── src-tauri/               # Código backend Rust
│   └── src/
│       └── main.rs          # Ponto de entrada do Rust
│
├── public/                  # Arquivos estáticos
├── tailwind.config.js       # Configuração do Tailwind
└── postcss.config.js        # Configuração do PostCSS
```

## Como Executar

```bash
# Instalar dependências
pnpm install

# Executar em modo de desenvolvimento
pnpm tauri dev

# Construir para produção
pnpm tauri build
```

## Próximos Passos (Fase 2)

1. **Backend**:
   - Implementar banco de dados SQLite para armazenamento persistente
   - Criar APIs para CRUD de prompts e categorias
   - Adicionar gerenciamento de estatísticas de uso

2. **Interface**:
   - ~~Melhorar a navegação entre categorias com a roda do mouse~~ ✅
   - Adicionar suporte a ícones/sprites personalizados
   - Implementar interface de configuração

3. **Funcionalidades Avançadas**:
   - Sistema de substituição de variáveis em prompts
   - Importação/exportação de bibliotecas de prompts
   - Integração com aplicações específicas

## Licença

MIT
