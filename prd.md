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
- Global hotkey activation (Alt+Shift+') that works system-wide
- Translucent GTA5-style weapon wheel interface (highly faithful to GTA5)
- Mouse-based selection of prompts

#### Prompt Management
- Storage for unlimited prompts in the "arsenal"
- Display of 8 selectable prompts in the wheel at any time
- Category system with mouse wheel rotation to switch between categories
- Import/export functionality for sharing prompt collections
- Custom sprites/icons for different prompt types or categories
- Simple text replacement variables (Phase 1)
- Application-stored variables for more complex replacements (Phase 2)

#### Analytics & Feedback
- Usage statistics tracking (times used, last used date)
- Visual feedback when selecting a prompt

#### Platform Compatibility
- Cross-platform support (Windows, macOS, Linux)
- Works in both browsers and desktop applications

### User Flow
1. User presses Alt+Shift+' from any application
2. Translucent GTA-style wheel appears on screen
3. User navigates categories with mouse wheel
4. User selects desired prompt with mouse
5. Selected prompt is immediately pasted at cursor position
6. Widget disappears after selection

## Architecture Design Record (ADR)

### Architecture Overview
A Tauri-based application combining a Rust backend with a React frontend.

### Technical Stack

#### Frontend
- Framework: React with TypeScript
- Styling: TailwindCSS
- Animation: Framer Motion
- SVG Handling: react-svg

#### Backend
- Framework: Tauri core
- Database: rusqlite for SQLite interactions
- System Integration: Tauri APIs for global shortcuts, clipboard operations, and window management

#### Data Storage
- Database: SQLite with optional encryption
- Data Model:
  ```
  Prompts {
    id: UUID
    content: TEXT
    category_id: UUID
    icon_path: TEXT (optional)
    created_at: TIMESTAMP
    variables: JSON (for text replacement)
  }

  Categories {
    id: UUID
    name: TEXT
    color: TEXT
    position: INTEGER
  }

  Usage {
    prompt_id: UUID
    used_count: INTEGER
    last_used: TIMESTAMP
  }
  ```

### Core Components

#### Rust Backend Components
1. **Global Hotkey Manager**: Registers and listens for Alt+Shift+'
2. **Window Manager**: Controls transparent overlay positioning and visibility
3. **System Integration**: Handles clipboard operations and input events
4. **Database Interface**: Manages SQLite operations for prompts and statistics

#### React Frontend Components
1. **Wheel Component**: GTA-style circular UI with segments
2. **Prompt Manager**: Handles CRUD operations for prompts
3. **Category Navigator**: Controls switching between categories
4. **Statistics Tracker**: Displays and updates usage metrics

### Implementation Plan

#### Phase 1: Foundation
- Setup Tauri project with React
- Implement global hotkeys and transparent window
- Create database schema and basic CRUD operations

#### Phase 2: UI Implementation
- Develop accurate SVG-based wheel matching GTA5 design
- Implement segment highlighting and selection
- Add sprite/icon support for prompts

#### Phase 3: Core Functionality
- Implement prompt selection and pasting
- Add variable replacement system
- Create category navigation with mouse wheel

#### Phase 4: Advanced Features
- Add import/export for prompt libraries
- Implement settings and customization
- Optimize performance and memory usage

### Project Structure (Suggested)
```
/
├── src/                     # Rust backend code
│   ├── main.rs              # Entry point
│   ├── hotkey.rs            # Global hotkey handling
│   ├── window.rs            # Transparent window management
│   ├── clipboard.rs         # Clipboard operations
│   └── database/            # Database operations
│       ├── mod.rs
│       ├── prompts.rs
│       ├── categories.rs
│       └── usage.rs
│
├── src-tauri/               # Tauri configuration
│   ├── tauri.conf.json      # Tauri config
│   └── icons/               # Application icons
│
└── ui/                      # Frontend
    ├── src/
    │   ├── components/
    │   │   ├── WheelComponent.tsx    # Main wheel UI
    │   │   ├── PromptSegment.tsx     # Individual prompt segment
    │   │   ├── CategoryIndicator.tsx # Category display
    │   │   └── StatsDisplay.tsx      # Usage statistics
    │   ├── hooks/
    │   │   ├── usePrompts.ts         # Prompt data management
    │   │   ├── useCategories.ts      # Category navigation
    │   │   └── useSelection.ts       # Selection handling
    │   ├── services/
    │   │   ├── promptService.ts      # Backend communication
    │   │   └── clipboardService.ts   # Clipboard operations
    │   ├── App.tsx
    │   └── index.tsx
    ├── public/
    └── package.json
```

This summary provides a solid foundation to begin implementation with Cursor. Let me know if you need more specific details on any component or if you'd like to adjust the architecture before proceeding.