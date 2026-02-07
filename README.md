# Monsterworks - Dark Industry Factory Game

A grid-based factory automation game where you manage creatures and buildings in a dark fantasy setting. Build production facilities, spawn creatures to work them, and optimize your resource flows.

## Current Game State

### 🎮 Gameplay Mechanics

**Core Loop:**
1. Buildings automatically produce resources and store them locally
2. Creatures seek work at buildings with available resources
3. Creatures collect resources from production buildings
4. Creatures deliver resources to storage buildings (Corpse Pile)
5. Delivered resources are added to your global inventory

**Grid System:**
- 50x50 pixel grid cells with snap-to-grid placement
- Visual grid lines for precise building placement
- Left-click to place selected buildings/creatures

### 🏭 Buildings

**Production Buildings:**
- **Bone Kiln** 🦴: Produces bone (rate: 1/second, storage: 10)
- **Slime Pit** 🫧: Produces corrupted water (rate: 1/second, storage: 10)

**Storage Buildings:**
- **Corpse Pile** 💀: Central storage for all resources (storage: 50)

**Building Features:**
- Real-time production counters showing current production progress
- Storage indicators showing current/max capacity (e.g., "3/10")
- Production stops when storage is full until creatures collect resources
- Visual indicators for resource types stored

### 👹 Creatures

**Available Creatures:**
- **Slime** 🟢: Capacity 2, Speed 1, Specializes in liquids/corruption
- **Goblin** 👺: Capacity 1, Speed 3, General purpose worker

**Creature AI:**
- Intelligent work-seeking with 5-second cooldown to prevent spam
- Automatic pathfinding and movement to work locations
- Resource collection from production buildings
- Delivery to storage buildings
- Energy management with rest cycles
- Visual status indicators and carrying amount display

### 📊 Resource System

**Current Resources:**
- **Bone**: Basic construction material
- **Corrupted Water**: Liquid resource for advanced processes
- **Flesh**: Primary currency for spawning creatures

**Resource Flow:**
```
Production Building → Building Storage → Creature Collection → Storage Building → Global Inventory
```

### 🎯 Controls

- **Left Click**: Place selected building/creature
- **Building Panel**: Select building types to place
- **Creature Panel**: Select creature types to spawn
- **Speed Controls**: Pause/resume game simulation
- **Resource Display**: View current inventory levels

### 🛠 Technical Features

**Architecture:**
- React + TypeScript frontend
- Zustand state management with service-based architecture
- Canvas-based rendering with 60fps visual updates
- Throttled game logic updates (200ms intervals)
- Pure component pattern for optimal performance

**Services:**
- `GameSimulationService`: Handles building production and energy updates
- `CreatureAIService`: Manages creature behavior and work decisions
- `BuildingService`: Building placement validation and creation
- `CreatureService`: Creature spawning and management

**Performance Optimizations:**
- Separated rendering from game logic updates
- Throttled AI decisions to prevent excessive processing
- Pure components to minimize re-renders
- Efficient distance calculations and pathfinding

### 🚀 Getting Started

1. **Install Dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Run Development Server:**
   ```bash
   npm run dev
   ```

3. **Open Browser:**
   Navigate to `http://localhost:5173`

### 🎮 How to Play

1. **Start with Basic Resources:** You begin with some flesh and bone
2. **Observe Initial Setup:** The game starts with a Bone Kiln, Slime Pit, and Corpse Pile already placed
3. **Watch Creatures Work:** Initial Slime and Goblin will automatically seek work
4. **Monitor Production:** Buildings show production progress and storage levels
5. **Expand Your Factory:** Use resources to place additional buildings and spawn more creatures

### 🐛 Current Status & Known Issues

**Working Features:**
- ✅ Grid-based building/creature placement
- ✅ Real-time production system with storage limits
- ✅ Intelligent creature AI with work-seeking and delivery
- ✅ Resource collection and delivery cycles
- ✅ Visual feedback for all game states
- ✅ Performance-optimized game loop

**Recent Fixes:**
- ✅ Fixed creature work-seeking spam (added 5-second cooldowns)
- ✅ Fixed building production display (shows actual values instead of confusing percentages)
- ✅ Fixed building storage overflow (production stops when storage is full)
- ✅ Separated business logic into services for better architecture

**Areas for Future Development:**
- 🔄 Expand building types and resource chains
- 🔄 Implement creature evolution system
- 🔄 Add more complex resource processing buildings
- 🔄 Implement research/upgrade systems
- 🔄 Add save/load functionality
- 🔄 Expand creature specialization mechanics

### 📁 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── game/           # Game canvas and UI components
│   │   └── ui/             # Reusable UI components
│   ├── services/           # Business logic services
│   ├── stores/             # Zustand state management
│   ├── types/              # TypeScript type definitions
│   ├── data/               # Game data and configuration
│   ├── hooks/              # Custom React hooks
│   └── utils/              # Utility functions
├── public/                 # Static assets
└── package.json            # Dependencies and scripts
```

### 🔧 Development

**Key Technologies:**
- **React 18** with TypeScript
- **Zustand** for state management
- **Canvas API** for rendering
- **Vite** for build tooling
- **TailwindCSS** for styling

**Debugging:**
The game includes extensive console logging for debugging:
- Building production and storage updates
- Creature AI decisions and movement
- Resource collection and delivery events
- Performance timing information

### 🎨 Game Design Philosophy

This game implements a **factory automation** genre with a **dark fantasy** theme, focusing on:
- **Emergent Complexity**: Simple rules creating complex behaviors
- **Visual Clarity**: Clear feedback for all game states
- **Resource Flow Management**: Balancing production, collection, and storage
- **Creature Autonomy**: AI-driven workers that make intelligent decisions
- **Performance**: Smooth gameplay even with many entities

---

*Monsterworks is actively in development. This README reflects the current state as of the latest build.*

## License

This project is licensed under the MIT License - see the individual component README files for details.

Part of the WebHatchery game collection.