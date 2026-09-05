/**
 * "A Little Universe" - Application Bootstrapper
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize 3D Engine
  const engine = new Universe3DEngine('threejs-canvas-container');

  // 2. Initialize Gameplay Tracker
  const gameplay = new UniverseGameplay(engine, window.UniverseAudio);

  // 3. Initialize UI View Manager
  const ui = new UniverseUI(engine, gameplay, window.UniverseAudio);

  // Attach global reference for easy debugging & replay calls
  window.universeApp = {
    engine,
    gameplay,
    ui,
    audio: window.UniverseAudio
  };

  window.replayUniverse = () => {
    ui.replayUniverse();
  };

  window.closeMemoryModal = () => {
    ui.closeMemoryModal();
  };

  console.log("✦ A Little Universe is ready. Explore the stars! 🌌");
});
