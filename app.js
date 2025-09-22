// Game data from application_data_json
const GAME_DATA = {
  creatures: {
    ant: {emoji: "🐜", name: "Ant", capacity: 1, speed: 3, cost: {wood: 2}, specialties: ["stone", "wood"]},
    bear: {emoji: "🐻", name: "Bear", capacity: 5, speed: 1, cost: {food: 5, stone: 3}, specialties: ["food", "heavy"]},
    rabbit: {emoji: "🐰", name: "Rabbit", capacity: 2, speed: 4, cost: {food: 3}, specialties: ["food", "light"]},
    elephant: {emoji: "🐘", name: "Elephant", capacity: 8, speed: 0.5, cost: {food: 10, stone: 8}, specialties: ["stone", "construction"]},
    bee: {emoji: "🐝", name: "Bee", capacity: 1, speed: 3, cost: {food: 2, charm: 1}, specialties: ["charm", "magic"]},
    butterfly: {emoji: "🦋", name: "Butterfly", capacity: 1, speed: 2, cost: {charm: 3}, specialties: ["charm", "upgrade"]},
    turtle: {emoji: "🐢", name: "Turtle", capacity: 3, speed: 1, cost: {stone: 5}, specialties: ["any"]},
    eagle: {emoji: "🦅", name: "Eagle", capacity: 2, speed: 4, cost: {food: 4, upgrade: 2}, specialties: ["flying", "any"]},
    horse: {emoji: "🐎", name: "Horse", capacity: 4, speed: 3, cost: {food: 6, wood: 4}, specialties: ["general"]},
    camel: {emoji: "🐪", name: "Camel", capacity: 3, speed: 2, cost: {food: 5}, specialties: ["endurance"]}
  },
  buildings: {
    quarry: {emoji: "⛰️", name: "Quarry", produces: "stone", rate: 1, cost: {wood: 10}},
    forest: {emoji: "🌳", name: "Forest", produces: "wood", rate: 1, cost: {stone: 5}},
    workshop: {emoji: "🏭", name: "Workshop", produces: "metal", rate: 0.5, cost: {stone: 8, wood: 8}},
    farm: {emoji: "🍇", name: "Farm", produces: "food", rate: 1, cost: {wood: 6, stone: 4}},
    bakery: {emoji: "🏪", name: "Bakery", produces: "bread", rate: 0.5, cost: {wood: 10, food: 5}},
    dairy: {emoji: "🐄", name: "Dairy", produces: "milk", rate: 0.5, cost: {wood: 12, food: 8}},
    crafting: {emoji: "🔨", name: "Crafting Station", input: ["stone", "wood", "metal"], output: "charm", ratio: 0.3, cost: {stone: 15, wood: 15, metal: 5}},
    school: {emoji: "🏫", name: "School", input: ["food", "bread"], output: "knowledge", ratio: 0.2, cost: {wood: 20, stone: 10, food: 10}},
    lab: {emoji: "⚗️", name: "Lab", input: ["charm", "knowledge"], output: "upgrade", ratio: 0.1, cost: {stone: 25, wood: 20, charm: 10}},
    warehouse: {emoji: "📦", name: "Warehouse", storage: 100, cost: {wood: 8, stone: 8}},
    home: {emoji: "🏠", name: "Home", rest: 5, cost: {wood: 15, food: 5}}
  },
  resources: {
    stone: {emoji: "🧱", name: "Stone", color: "#8B4513"},
    wood: {emoji: "🪵", name: "Wood", color: "#D2691E"},
    metal: {emoji: "⚙️", name: "Metal", color: "#708090"},
    food: {emoji: "🍎", name: "Food", color: "#FF6347"},
    bread: {emoji: "🥖", name: "Bread", color: "#F4A460"},
    milk: {emoji: "🥛", name: "Milk", color: "#FFF8DC"},
    charm: {emoji: "✨", name: "Charm", color: "#9370DB"},
    knowledge: {emoji: "📚", name: "Knowledge", color: "#4169E1"},
    upgrade: {emoji: "🔧", name: "Upgrade", color: "#FFD700"}
  }
};

// Game state
class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.resources = {stone: 20, wood: 15, food: 10, metal: 0, bread: 0, milk: 0, charm: 0, knowledge: 0, upgrade: 0};
    this.buildings = [];
    this.creatures = [];
    this.selectedBuildingType = null;
    this.selectedCreatureType = null;
    this.selectedObject = null;
    this.gameSpeed = 1;
    this.isPaused = false;
    this.lastTime = 0;
    
    this.setupEventListeners();
    this.setupUI();
    this.initializeGame();
    this.gameLoop();
  }
  
  initializeGame() {
    // Add starting buildings
    this.buildings.push(new Building('quarry', 150, 150));
    this.buildings.push(new Building('forest', 300, 150));
    this.buildings.push(new Building('warehouse', 450, 150));
    
    // Add starting creatures
    this.creatures.push(new Creature('ant', 200, 200));
    this.creatures.push(new Creature('ant', 250, 200));
    
    // Update resources display after initialization
    this.updateResourceDisplay();
  }
  
  setupEventListeners() {
    this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
    this.canvas.addEventListener('contextmenu', (e) => this.handleCanvasRightClick(e));
    
    document.getElementById('pauseBtn').addEventListener('click', () => this.pause());
    document.getElementById('normalSpeedBtn').addEventListener('click', () => this.setSpeed(1));
    document.getElementById('fastSpeedBtn').addEventListener('click', () => this.setSpeed(2));
    document.getElementById('closeInfoBtn').addEventListener('click', () => this.hideInfoPanel());
  }
  
  setupUI() {
    this.setupBuildingsPanel();
    this.setupCreaturesPanel();
    this.updateResourceDisplay();
  }
  
  setupBuildingsPanel() {
    const panel = document.getElementById('buildingsPanel');
    Object.entries(GAME_DATA.buildings).forEach(([key, building]) => {
      const item = document.createElement('div');
      item.className = 'building-item';
      item.dataset.building = key;
      
      const costText = Object.entries(building.cost)
        .map(([res, amount]) => `${GAME_DATA.resources[res].emoji}${amount}`)
        .join(' ');
      
      item.innerHTML = `
        <div class="building-icon">${building.emoji}</div>
        <div class="building-name">${building.name}</div>
        <div class="building-cost">${costText}</div>
      `;
      
      item.addEventListener('click', () => this.selectBuilding(key));
      panel.appendChild(item);
    });
  }
  
  setupCreaturesPanel() {
    const panel = document.getElementById('creaturesPanel');
    Object.entries(GAME_DATA.creatures).forEach(([key, creature]) => {
      const item = document.createElement('div');
      item.className = 'creature-item';
      item.dataset.creature = key;
      
      const costText = Object.entries(creature.cost)
        .map(([res, amount]) => `${GAME_DATA.resources[res].emoji}${amount}`)
        .join(' ');
      
      item.innerHTML = `
        <div class="creature-icon">${creature.emoji}</div>
        <div class="creature-name">${creature.name}</div>
        <div class="creature-cost">${costText}</div>
      `;
      
      item.addEventListener('click', () => this.selectCreature(key));
      panel.appendChild(item);
    });
  }
  
  selectBuilding(type) {
    document.querySelectorAll('.building-item').forEach(item => item.classList.remove('selected'));
    document.querySelector(`[data-building="${type}"]`).classList.add('selected');
    this.selectedBuildingType = type;
    this.selectedCreatureType = null;
    document.querySelectorAll('.creature-item').forEach(item => item.classList.remove('selected'));
  }
  
  selectCreature(type) {
    document.querySelectorAll('.creature-item').forEach(item => item.classList.remove('selected'));
    document.querySelector(`[data-creature="${type}"]`).classList.add('selected');
    this.selectedCreatureType = type;
    this.selectedBuildingType = null;
    document.querySelectorAll('.building-item').forEach(item => item.classList.remove('selected'));
  }
  
  handleCanvasClick(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check if clicking on a building or creature
    const clickedBuilding = this.buildings.find(b => 
      x >= b.x - 20 && x <= b.x + 20 && y >= b.y - 20 && y <= b.y + 20
    );
    
    const clickedCreature = this.creatures.find(c => 
      x >= c.x - 12 && x <= c.x + 12 && y >= c.y - 12 && y <= c.y + 12
    );
    
    if (clickedBuilding) {
      this.selectedObject = clickedBuilding;
      this.showInfoPanel(clickedBuilding);
    } else if (clickedCreature) {
      this.selectedObject = clickedCreature;
      this.showInfoPanel(clickedCreature);
    } else {
      this.selectedObject = null;
      this.hideInfoPanel();
    }
  }
  
  handleCanvasRightClick(e) {
    e.preventDefault();
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (this.selectedBuildingType) {
      this.placeBuilding(this.selectedBuildingType, x, y);
    } else if (this.selectedCreatureType) {
      this.placeCreature(this.selectedCreatureType, x, y);
    }
  }
  
  placeBuilding(type, x, y) {
    const buildingData = GAME_DATA.buildings[type];
    if (this.canAfford(buildingData.cost)) {
      this.spendResources(buildingData.cost);
      this.buildings.push(new Building(type, x, y));
      this.updateResourceDisplay();
    }
  }
  
  placeCreature(type, x, y) {
    if (this.creatures.length >= 50) return; // Max creatures limit
    const creatureData = GAME_DATA.creatures[type];
    if (this.canAfford(creatureData.cost)) {
      this.spendResources(creatureData.cost);
      this.creatures.push(new Creature(type, x, y));
      this.updateResourceDisplay();
    }
  }
  
  canAfford(cost) {
    return Object.entries(cost).every(([res, amount]) => this.resources[res] >= amount);
  }
  
  spendResources(cost) {
    Object.entries(cost).forEach(([res, amount]) => {
      this.resources[res] -= amount;
    });
  }
  
  addResource(type, amount) {
    this.resources[type] = (this.resources[type] || 0) + amount;
    this.updateResourceDisplay();
  }
  
  updateResourceDisplay() {
    Object.keys(this.resources).forEach(resource => {
      const element = document.getElementById(resource);
      if (element) {
        element.textContent = Math.floor(this.resources[resource]);
      }
    });
    
    // Update building/creature affordability
    this.updateAffordability();
  }
  
  updateAffordability() {
    document.querySelectorAll('.building-item').forEach(item => {
      const type = item.dataset.building;
      const cost = GAME_DATA.buildings[type].cost;
      if (this.canAfford(cost)) {
        item.classList.remove('disabled');
      } else {
        item.classList.add('disabled');
      }
    });
    
    document.querySelectorAll('.creature-item').forEach(item => {
      const type = item.dataset.creature;
      const cost = GAME_DATA.creatures[type].cost;
      if (this.canAfford(cost)) {
        item.classList.remove('disabled');
      } else {
        item.classList.add('disabled');
      }
    });
  }
  
  showInfoPanel(obj) {
    const panel = document.getElementById('infoPanel');
    const content = document.getElementById('infoPanelContent');
    
    if (obj instanceof Building) {
      const buildingData = GAME_DATA.buildings[obj.type];
      let statusInfo = '';
      if (buildingData.produces) {
        statusInfo = `<div><span class="stat-label">Produces:</span> <span>${GAME_DATA.resources[buildingData.produces].emoji} ${buildingData.produces}</span></div>`;
        if (buildingData.rate) {
          statusInfo += `<div><span class="stat-label">Rate:</span> <span>${buildingData.rate}/sec</span></div>`;
        }
      }
      if (buildingData.input && buildingData.output) {
        const inputText = buildingData.input.map(res => GAME_DATA.resources[res].emoji + res).join(', ');
        statusInfo = `<div><span class="stat-label">Input:</span> <span>${inputText}</span></div>`;
        statusInfo += `<div><span class="stat-label">Output:</span> <span>${GAME_DATA.resources[buildingData.output].emoji} ${buildingData.output}</span></div>`;
      }
      if (buildingData.storage) {
        statusInfo = `<div><span class="stat-label">Storage:</span> <span>${buildingData.storage}</span></div>`;
        // Show stored resources
        Object.entries(obj.resources).forEach(([res, amount]) => {
          if (amount > 0) {
            statusInfo += `<div><span class="stat-label">${GAME_DATA.resources[res].name}:</span> <span>${Math.floor(amount)}</span></div>`;
          }
        });
      }
      
      content.innerHTML = `
        <h4>${buildingData.emoji} ${buildingData.name}</h4>
        <div class="info-stats">
          ${statusInfo}
          <div><span class="stat-label">Position:</span> <span>(${Math.round(obj.x)}, ${Math.round(obj.y)})</span></div>
        </div>
      `;
    } else if (obj instanceof Creature) {
      const creatureData = GAME_DATA.creatures[obj.type];
      const specialtiesText = creatureData.specialties.join(', ');
      content.innerHTML = `
        <h4>${creatureData.emoji} ${creatureData.name}</h4>
        <div class="info-stats">
          <div><span class="stat-label">Capacity:</span> <span>${creatureData.capacity}</span></div>
          <div><span class="stat-label">Speed:</span> <span>${creatureData.speed}</span></div>
          <div><span class="stat-label">Status:</span> <span>${obj.status}</span></div>
          <div><span class="stat-label">Energy:</span> <span>${Math.round(obj.energy)}%</span></div>
          <div><span class="stat-label">Specialties:</span> <span>${specialtiesText}</span></div>
          ${obj.carrying.length > 0 ? `<div><span class="stat-label">Carrying:</span> <span>${obj.carrying.map(r => GAME_DATA.resources[r].emoji + r).join(', ')}</span></div>` : ''}
          <div><span class="stat-label">Position:</span> <span>(${Math.round(obj.x)}, ${Math.round(obj.y)})</span></div>
        </div>
      `;
    }
    
    panel.classList.remove('hidden');
  }
  
  hideInfoPanel() {
    document.getElementById('infoPanel').classList.add('hidden');
  }
  
  pause() {
    this.isPaused = !this.isPaused;
    const pauseBtn = document.getElementById('pauseBtn');
    pauseBtn.textContent = this.isPaused ? '▶️' : '⏸️';
  }
  
  setSpeed(speed) {
    this.gameSpeed = speed;
    // Update button styles to show active speed
    document.querySelectorAll('.speed-controls .btn').forEach(btn => btn.classList.remove('btn--primary'));
    if (speed === 1) {
      document.getElementById('normalSpeedBtn').classList.add('btn--primary');
    } else if (speed === 2) {
      document.getElementById('fastSpeedBtn').classList.add('btn--primary');
    }
  }
  
  update(deltaTime) {
    if (this.isPaused) return;
    
    const dt = deltaTime * this.gameSpeed;
    
    // Update buildings
    this.buildings.forEach(building => building.update(dt, this));
    
    // Update creatures
    this.creatures.forEach(creature => creature.update(dt, this));
  }
  
  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw grid
    this.drawGrid();
    
    // Draw buildings
    this.buildings.forEach(building => building.render(this.ctx));
    
    // Draw creatures
    this.creatures.forEach(creature => creature.render(this.ctx));
    
    // Draw selection indicator
    if (this.selectedObject) {
      this.ctx.strokeStyle = '#32a852';
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      this.ctx.arc(this.selectedObject.x, this.selectedObject.y, 25, 0, Math.PI * 2);
      this.ctx.stroke();
    }
  }
  
  drawGrid() {
    this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
    this.ctx.lineWidth = 1;
    
    // Vertical lines
    for (let x = 0; x < this.canvas.width; x += 50) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvas.height);
      this.ctx.stroke();
    }
    
    // Horizontal lines
    for (let y = 0; y < this.canvas.height; y += 50) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.canvas.width, y);
      this.ctx.stroke();
    }
  }
  
  gameLoop(currentTime = 0) {
    const deltaTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;
    
    this.update(deltaTime);
    this.render();
    
    requestAnimationFrame((time) => this.gameLoop(time));
  }
}

// Building class
class Building {
  constructor(type, x, y) {
    this.type = type;
    this.x = x;
    this.y = y;
    this.data = GAME_DATA.buildings[type];
    this.lastProduction = 0;
    this.resources = {};
    
    if (this.data.storage) {
      Object.keys(GAME_DATA.resources).forEach(res => {
        this.resources[res] = 0;
      });
    }
  }
  
  update(deltaTime, game) {
    this.lastProduction += deltaTime;
    
    if (this.data.produces && this.lastProduction >= 1) {
      const amount = this.data.rate * Math.floor(this.lastProduction);
      if (this.data.storage) {
        // Store in building
        this.resources[this.data.produces] = Math.min(
          (this.resources[this.data.produces] || 0) + amount,
          this.data.storage
        );
      } else {
        // Add directly to game resources
        game.addResource(this.data.produces, amount);
      }
      this.lastProduction = this.lastProduction % 1;
    }
    
    // Processing buildings
    if (this.data.input && this.data.output && this.lastProduction >= 2) {
      const canProcess = this.data.input.every(res => 
        game.resources[res] >= 1
      );
      
      if (canProcess) {
        this.data.input.forEach(res => game.resources[res] -= 1);
        game.addResource(this.data.output, this.data.ratio);
        this.lastProduction = 0;
      }
    }
  }
  
  render(ctx) {
    ctx.font = '32px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#000';
    ctx.fillText(this.data.emoji, this.x, this.y + 10);
    
    // Show resources for storage buildings
    if (this.data.storage) {
      ctx.font = '10px Arial';
      ctx.fillStyle = '#666';
      let yOffset = 25;
      Object.entries(this.resources).forEach(([res, amount]) => {
        if (amount > 0) {
          ctx.fillText(`${GAME_DATA.resources[res].emoji}${Math.floor(amount)}`, this.x, this.y + yOffset);
          yOffset += 12;
        }
      });
      ctx.fillStyle = '#000';
    }
    
    // Show production indicator
    if (this.data.produces || this.data.output) {
      const resource = this.data.produces || this.data.output;
      ctx.font = '12px Arial';
      ctx.fillText(GAME_DATA.resources[resource].emoji, this.x, this.y - 15);
    }
  }
  
  hasResource(type) {
    return (this.resources[type] || 0) > 0;
  }
  
  takeResource(type, amount = 1) {
    const available = Math.min(this.resources[type] || 0, amount);
    this.resources[type] = (this.resources[type] || 0) - available;
    return available;
  }
  
  storeResource(type, amount) {
    if (!this.data.storage) return 0;
    const total = Object.values(this.resources).reduce((sum, val) => sum + val, 0);
    const canStore = Math.min(amount, this.data.storage - total);
    this.resources[type] = (this.resources[type] || 0) + canStore;
    return canStore;
  }
}

// Creature class
class Creature {
  constructor(type, x, y) {
    this.type = type;
    this.x = x;
    this.y = y;
    this.data = GAME_DATA.creatures[type];
    this.carrying = [];
    this.status = 'idle';
    this.targetX = x;
    this.targetY = y;
    this.target = null;
    this.task = null;
    this.restTime = 0;
    this.energy = 100;
    this.workCooldown = 0;
  }
  
  update(deltaTime, game) {
    this.workCooldown = Math.max(0, this.workCooldown - deltaTime);
    
    // Decrease energy over time
    this.energy = Math.max(0, this.energy - deltaTime * 3);
    
    // Rest if tired
    if (this.energy < 20 && this.status !== 'resting') {
      this.findRestLocation(game);
      return;
    }
    
    if (this.status === 'resting') {
      this.restTime += deltaTime;
      this.energy = Math.min(100, this.energy + deltaTime * 25);
      if (this.restTime >= 2 || this.energy >= 90) {
        this.status = 'idle';
        this.restTime = 0;
      }
      return;
    }
    
    // Move towards target
    this.moveToTarget(deltaTime);
    
    // Find work if idle
    if (this.status === 'idle' && this.workCooldown <= 0) {
      this.findWork(game);
    }
    
    // Handle work at target
    if (this.isAtTarget() && this.target && this.workCooldown <= 0) {
      this.handleWork(game);
    }
  }
  
  moveToTarget(deltaTime) {
    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 2) {
      const speed = this.data.speed * 30 * deltaTime;
      this.x += (dx / distance) * speed;
      this.y += (dy / distance) * speed;
    }
  }
  
  isAtTarget() {
    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    return Math.sqrt(dx * dx + dy * dy) < 8;
  }
  
  findWork(game) {
    if (this.carrying.length === 0) {
      // Find resources to pick up
      const source = this.findResourceSource(game);
      if (source) {
        this.setTarget(source);
        this.task = 'pickup';
        this.status = 'working';
      }
    } else {
      // Find place to deliver
      const destination = this.findDeliveryLocation(game);
      if (destination) {
        this.setTarget(destination);
        this.task = 'deliver';
        this.status = 'carrying';
      }
    }
  }
  
  findResourceSource(game) {
    // Look for production buildings first
    const producers = game.buildings.filter(building => {
      if (!building.data.produces) return false;
      const resourceType = building.data.produces;
      return this.canCarry(resourceType) && game.resources[resourceType] > 0;
    });
    
    if (producers.length > 0) {
      return producers[Math.floor(Math.random() * producers.length)];
    }
    
    // Then look for storage buildings with resources
    return game.buildings.find(building => {
      if (!building.data.storage) return false;
      return Object.keys(building.resources).some(res => 
        building.resources[res] > 0 && this.canCarry(res)
      );
    });
  }
  
  findDeliveryLocation(game) {
    const warehouses = game.buildings.filter(building => building.data.storage);
    if (warehouses.length > 0) {
      return warehouses.find(w => {
        const totalStored = Object.values(w.resources).reduce((sum, val) => sum + val, 0);
        return totalStored < w.data.storage;
      }) || warehouses[0];
    }
    return null;
  }
  
  findRestLocation(game) {
    const home = game.buildings.find(b => b.type === 'home');
    if (home) {
      this.setTarget(home);
      this.status = 'resting';
      this.task = 'rest';
    } else {
      // Rest in place if no home
      this.status = 'resting';
    }
  }
  
  canCarry(resourceType) {
    if (this.carrying.length >= this.data.capacity) return false;
    
    const specialties = this.data.specialties;
    if (specialties.includes('any') || specialties.includes('general')) return true;
    
    const resourceCategories = {
      stone: ['stone', 'heavy', 'construction'],
      wood: ['wood', 'light'],
      metal: ['metal', 'heavy'],
      food: ['food', 'light'],
      bread: ['food', 'light'],
      milk: ['food', 'light'],
      charm: ['charm', 'magic'],
      knowledge: ['upgrade', 'light'],
      upgrade: ['upgrade', 'magic']
    };
    
    const categories = resourceCategories[resourceType] || [];
    return specialties.some(spec => categories.includes(spec));
  }
  
  setTarget(building) {
    this.target = building;
    this.targetX = building.x + (Math.random() - 0.5) * 30;
    this.targetY = building.y + (Math.random() - 0.5) * 30;
  }
  
  handleWork(game) {
    if (this.task === 'pickup') {
      let pickedUp = false;
      
      if (this.target.data.produces && !this.target.data.storage) {
        // Pick up from production building
        const resourceType = this.target.data.produces;
        if (this.canCarry(resourceType) && game.resources[resourceType] > 0) {
          game.resources[resourceType] -= 1;
          this.carrying.push(resourceType);
          pickedUp = true;
        }
      } else if (this.target.data.storage) {
        // Pick up from storage
        for (const [res, amount] of Object.entries(this.target.resources)) {
          if (amount > 0 && this.canCarry(res) && this.carrying.length < this.data.capacity) {
            this.target.takeResource(res, 1);
            this.carrying.push(res);
            pickedUp = true;
            break;
          }
        }
      }
      
      if (pickedUp) {
        this.status = 'carrying';
        this.task = null;
        this.target = null;
        this.workCooldown = 0.5;
      } else {
        this.status = 'idle';
        this.task = null;
        this.target = null;
        this.workCooldown = 1;
      }
      
    } else if (this.task === 'deliver') {
      if (this.target.data.storage && this.carrying.length > 0) {
        const resourceType = this.carrying.pop();
        const stored = this.target.storeResource(resourceType, 1);
        if (stored === 0) {
          // Couldn't store, add back to game resources
          game.addResource(resourceType, 1);
        }
        game.updateResourceDisplay();
      }
      
      if (this.carrying.length === 0) {
        this.status = 'idle';
        this.task = null;
        this.target = null;
        this.workCooldown = 0.5;
      }
    }
  }
  
  render(ctx) {
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#000';
    ctx.fillText(this.data.emoji, this.x, this.y + 6);
    
    // Show carrying resources
    if (this.carrying.length > 0) {
      ctx.font = '10px Arial';
      this.carrying.forEach((res, i) => {
        ctx.fillText(GAME_DATA.resources[res].emoji, this.x + (i - this.carrying.length/2 + 0.5) * 10, this.y - 12);
      });
    }
    
    // Show status indicator
    ctx.font = '8px Arial';
    ctx.fillStyle = this.getStatusColor();
    ctx.fillText(this.status, this.x, this.y + 20);
    ctx.fillStyle = '#000';
    
    // Show energy bar
    ctx.fillStyle = '#ff4444';
    ctx.fillRect(this.x - 8, this.y - 18, 16, 2);
    ctx.fillStyle = '#44ff44';
    ctx.fillRect(this.x - 8, this.y - 18, (this.energy / 100) * 16, 2);
    ctx.fillStyle = '#000';
  }
  
  getStatusColor() {
    switch (this.status) {
      case 'idle': return '#666';
      case 'working': return '#32a852';
      case 'carrying': return '#f39c12';
      case 'resting': return '#9b59b6';
      default: return '#000';
    }
  }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
  new Game();
});