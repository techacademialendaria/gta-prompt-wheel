# GTA-Style Prompt Wheel: Project Overview

Here's a comprehensive summary of the PRD and ADR for your GTA-style prompt wheel that you can add to Cursor to begin implementation:

## Product Requirements Document (PRD)

### Product Overview
A system-wide, GTA5-inspired prompt selection widget allowing AI enthusiasts and prompt engineers to quickly access and paste frequently used prompts from anywhere on their system.

### Target Users
- Primary: AI enthusiasts and prompt engineers
- Secondary: Anyone who frequently reuses text snippets or templates

### Core Requirements

#### Activation & Interface
- ✅ Global hotkey activation (Alt+Shift) that works system-wide
- ✅ Translucent GTA5-style weapon wheel interface (highly faithful to GTA5)
- ✅ Mouse-based selection of prompts

#### Prompt Management
- ✅ Display of 8 selectable prompts in the wheel at any time
- ✅ Custom sprites/icons for different prompt types or categories
- ✅ Category system with indicator
- 🔄 Storage for unlimited prompts in the "arsenal" (in progresso)
- 🔄 Mouse wheel rotation to switch between categories (em implementação)
- ❌ Import/export functionality for sharing prompt collections (pendente)
- ❌ Simple text replacement variables (Phase 1) (pendente)
- ❌ Application-stored variables for more complex replacements (Phase 2) (pendente)

#### Analytics & Feedback
- ✅ Visual feedback when selecting a prompt (destaque em laranja e painel flutuante)
- ❌ Usage statistics tracking (times used, last used date) (pendente)

#### Platform Compatibility
- 🔄 Cross-platform support (Windows e web implementados, macOS e Linux pendentes)
- ✅ Works in both browsers and desktop applications

### User Flow
1. ✅ User presses Alt+Shift from any application
2. ✅ Translucent GTA-style wheel appears on screen
3. 🔄 User navigates categories with mouse wheel (em implementação)
4. ✅ User selects desired prompt with mouse
5. ✅ Selected prompt is immediately copied to clipboard
6. ✅ Widget disappears after selection

## Architecture Design Record (ADR)

### Architecture Overview
A Tauri-based application combining a Rust backend with a React frontend.

### Technical Stack

#### Frontend
- ✅ Framework: React with TypeScript
- ✅ Styling: TailwindCSS
- ✅ Animation: Framer Motion
- ❌ SVG Handling: react-svg (substituído por implementação nativa SVG)

#### Backend
- 🔄 Framework: Tauri core (em implementação)
- ❌ Database: rusqlite for SQLite interactions (pendente)
- 🔄 System Integration: Tauri APIs for global shortcuts, clipboard operations, and window management (parcialmente implementado)

#### Data Storage
- ❌ Database: SQLite with optional encryption (pendente)
- ❌ Data Model implementado (pendente)

### Core Components

#### Rust Backend Components
1. 🔄 **Global Hotkey Manager**: Registers and listens for Alt+Shift (implementado)
2. 🔄 **Window Manager**: Controls transparent overlay positioning and visibility (implementado)
3. 🔄 **System Integration**: Handles clipboard operations and input events (parcialmente implementado)
4. ❌ **Database Interface**: Manages SQLite operations for prompts and statistics (pendente)

#### React Frontend Components
1. ✅ **Wheel Component**: GTA-style circular UI with segments
2. ❌ **Prompt Manager**: Handles CRUD operations for prompts (pendente)
3. 🔄 **Category Navigator**: Controls switching between categories (parcialmente implementado)
4. ❌ **Statistics Tracker**: Displays and updates usage metrics (pendente)

### Implementation Plan

#### Phase 1: Foundation ✅
- ✅ Setup project with React
- ✅ Implement transparent window
- 🔄 Create data structures for basic operations

#### Phase 2: UI Implementation ✅
- ✅ Develop accurate SVG-based wheel matching GTA5 design
- ✅ Implement segment highlighting and selection
- ✅ Add sprite/icon support for prompts

#### Phase 3: Core Functionality 🔄
- ✅ Implement prompt selection and pasting
- ❌ Add variable replacement system (pendente)
- 🔄 Create category navigation with mouse wheel (em implementação)

#### Phase 4: Advanced Features ❌
- ❌ Add import/export for prompt libraries (pendente)
- ❌ Implement settings and customization (pendente)
- ❌ Optimize performance and memory usage (pendente)

### Project Structure (Atual)
```
/gtprompt/
├── src/                     # Frontend code
│   ├── App.tsx              # Entry point
│   ├── App.css              # Styling
│   ├── components/          # UI Components
│   │   └── wheel/           # Wheel-related components
│   │       ├── WheelComponent.tsx    # Main wheel UI
│   │       └── CategoryIndicator.tsx # Category display
│   ├── hooks/
│   │   └── usePrompts.ts           # Prompt data management
│   ├── services/
│   │   └── clipboardService.ts     # Clipboard operations
│   └── index.tsx
├── public/
└── package.json
```

## Próximos Passos

1. Implementar mudança de categorias com roda do mouse
2. Criar sistema de armazenamento persistente para prompts e categorias
3. Desenvolver interface de administração para gerenciar prompts
4. Implementar sistema de variáveis para substituição nos prompts
5. Adicionar funcionalidades de importação/exportação para coleções de prompts

Estas atualizações refletem o progresso atual e o caminho a seguir no projeto. Muitos componentes fundamentais da UI estão implementados, com foco agora na funcionalidade completa do sistema.