/**
 * "A Little Universe" - Gameplay, Discovery & Progression Engine
 * Manages localStorage state, achievements, constellations, easter eggs, and surprise discovery.
 */

class UniverseGameplay {
  constructor(engine, audio) {
    this.engine = engine;
    this.audio = audio;

    this.discoveredStars = new Set();
    this.completedConstellations = new Set();
    this.unlockedAchievements = new Set();
    this.moonClicks = 0;

    this.loadState();
    this.initAchievements();
  }

  loadState() {
    try {
      const savedStars = localStorage.getItem('universe_discovered_stars');
      if (savedStars) {
        this.discoveredStars = new Set(JSON.parse(savedStars));
      }

      const savedConstellations = localStorage.getItem('universe_completed_constellations');
      if (savedConstellations) {
        this.completedConstellations = new Set(JSON.parse(savedConstellations));
      }

      const savedAchievements = localStorage.getItem('universe_unlocked_achievements');
      if (savedAchievements) {
        this.unlockedAchievements = new Set(JSON.parse(savedAchievements));
      }
    } catch (e) {
      console.warn("Storage not available:", e);
    }
  }

  saveState() {
    try {
      localStorage.setItem('universe_discovered_stars', JSON.stringify([...this.discoveredStars]));
      localStorage.setItem('universe_completed_constellations', JSON.stringify([...this.completedConstellations]));
      localStorage.setItem('universe_unlocked_achievements', JSON.stringify([...this.unlockedAchievements]));
    } catch (e) {
      console.warn("Could not save state:", e);
    }
  }

  initAchievements() {
    // Initial sync with engine
    this.discoveredStars.forEach(id => {
      this.engine.setStarDiscovered(id);
    });
    this.completedConstellations.forEach(id => {
      this.engine.setConstellationCompleted(id, true);
    });
  }

  // Record a star discovery
  discoverStar(starData) {
    const isNew = !this.discoveredStars.has(starData.id);
    this.discoveredStars.add(starData.id);
    this.engine.setStarDiscovered(starData.id);
    this.saveState();

    if (isNew) {
      if (this.audio) this.audio.playDiscover();

      // Check Achievements
      this.checkAchievementsAfterStar(starData);

      // Check Constellations
      this.checkConstellations();
    }

    return isNew;
  }

  checkAchievementsAfterStar(starData) {
    const count = this.discoveredStars.size;

    if (count >= 1) {
      this.unlockAchievement('first_star');
    }
    if (count >= 5) {
      this.unlockAchievement('night_explorer');
    }
    if (starData.id === 'star-16' || starData.type === 'secret') {
      this.unlockAchievement('pro_snooper');
    }
    if (starData.type === 'final' || count >= (window.UNIVERSE_DATA.stars.length - 1)) {
      this.unlockAchievement('cosmic_besties');
    }
  }

  checkConstellations() {
    const constellations = (window.UNIVERSE_DATA && window.UNIVERSE_DATA.constellations) || [];

    constellations.forEach(c => {
      if (!this.completedConstellations.has(c.id)) {
        const allDiscovered = c.starIds.every(id => this.discoveredStars.has(id));
        if (allDiscovered) {
          this.completedConstellations.add(c.id);
          this.engine.setConstellationCompleted(c.id, true);
          this.saveState();

          this.unlockAchievement('lore_keeper');
          this.showToast(`✦ Constellation Unlocked: ${c.name}!`, c.reward, 'auto_stories');
          if (this.audio) this.audio.playAchievement();
        }
      }
    });
  }

  // Surprise Me Discovery: finds undiscovered star and flies camera
  surpriseMe(onSelect) {
    const stars = (window.UNIVERSE_DATA && window.UNIVERSE_DATA.stars) || [];
    const undiscovered = stars.filter(s => s.type !== 'final' && !this.discoveredStars.has(s.id));

    if (this.audio) this.audio.playWarp();

    if (undiscovered.length === 0) {
      // Pick any random star
      const randomStar = stars[Math.floor(Math.random() * stars.length)];
      this.engine.flyToStar(randomStar, () => {
        if (onSelect) onSelect(randomStar);
      });
      this.showToast('✦ Universe Complete!', 'You have discovered all stars in this galaxy.', 'flare');
      return;
    }

    const targetStar = undiscovered[Math.floor(Math.random() * undiscovered.length)];
    this.engine.flyToStar(targetStar, () => {
      this.discoverStar(targetStar);
      if (onSelect) onSelect(targetStar);
    });
  }

  // Moon Easter Egg Handler
  handleMoonClick() {
    this.moonClicks++;
    if (this.moonClicks === 3) {
      this.showToast('🌙 The Moon Whispers...', 'Keep tapping the crescent moon for a celestial secret.', 'dark_mode');
    } else if (this.moonClicks >= 5) {
      this.unlockAchievement('moonstruck');
      this.showToast('🌙 Lunar Secret Unlocked!', '"Even 384,400 km away, we would still be best friends."', 'dark_mode');
      if (this.audio) this.audio.playAchievement();
      this.moonClicks = 0;
    } else {
      if (this.audio) this.audio.playTwinkle();
    }
  }

  // Shooting Star Catch Handler
  handleShootingStarCatch() {
    this.unlockAchievement('shooting_star_catcher');
    this.showToast('✨ You Caught a Shooting Star!', 'A wish was made: May our chaotic adventures never end.', 'flare');
    if (this.audio) this.audio.playAchievement();
  }

  unlockAchievement(achievementId) {
    if (this.unlockedAchievements.has(achievementId)) return;

    this.unlockedAchievements.add(achievementId);
    this.saveState();

    const achievement = window.UNIVERSE_DATA.achievements.find(a => a.id === achievementId);
    if (achievement) {
      this.showToast(`🏆 Trophy Unlocked: ${achievement.title}`, achievement.desc, achievement.icon || 'military_tech');
      if (this.audio) this.audio.playAchievement();
    }
  }

  showToast(title, message, icon = 'stars') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast-item';
    toast.innerHTML = `
      <div class="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary flex-shrink-0">
        <span class="material-symbols-outlined text-[20px]">${icon}</span>
      </div>
      <div class="flex flex-col">
        <span class="font-label-caps text-primary text-[11px] uppercase tracking-wider">${title}</span>
        <span class="font-body-sm text-[13px] text-on-surface/90 leading-snug">${message}</span>
      </div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('toast-out');
      setTimeout(() => toast.remove(), 300);
    }, 4500);
  }

  getDiscoveryProgress() {
    const total = window.UNIVERSE_DATA.stars.length;
    const count = this.discoveredStars.size;
    const percentage = Math.round((count / total) * 100);
    return { count, total, percentage };
  }

  resetProgress() {
    this.discoveredStars.clear();
    this.completedConstellations.clear();
    this.unlockedAchievements.clear();
    this.saveState();
    location.reload();
  }
}

window.UniverseGameplay = UniverseGameplay;
