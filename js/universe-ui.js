/**
 * "A Little Universe" - UI View & Interaction Controller
 * Manages Intro sequence, Navigation tabs, Polaroid Memory Modals,
 * Discoveries Scrapbook, Music Hub, Trophies, Finale, and Ambient Mode.
 */

class UniverseUI {
  constructor(engine, gameplay, audio) {
    this.engine = engine;
    this.gameplay = gameplay;
    this.audio = audio;

    this.currentTab = 'exploration';
    this.isAmbientMode = false;
    this.activeMemoryModal = null;
    this.activeCategoryFilter = 'all';
    this.monologueTimeout = null;
    this.favorites = new Set(JSON.parse(localStorage.getItem('universe_favorites') || '[]'));

    this.init();
  }

  init() {
    this.setupCustomCursor();
    this.setupIntroSequence();
    this.setupNavigation();
    this.setupHeaderActions();
    this.setupEngineCallbacks();
    this.updateProgressBadge();
    this.renderDiscoveries();
    this.renderTrophies();
  }

  // 1. Desktop Custom Glowing Cursor
  setupCustomCursor() {
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    const dot = document.createElement('div');
    dot.className = 'custom-cursor-dot';
    document.body.appendChild(cursor);
    document.body.appendChild(dot);

    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.left = `${mouseX}px`;
      dot.style.top = `${mouseY}px`;
    });

    const renderCursor = () => {
      cursorX += (mouseX - cursorX) * 0.15;
      cursorY += (mouseY - cursorY) * 0.15;
      cursor.style.left = `${cursorX}px`;
      cursor.style.top = `${cursorY}px`;
      requestAnimationFrame(renderCursor);
    };
    renderCursor();

    document.querySelectorAll('button, a, .clickable').forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('active'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('active'));
    });
  }

  // 2. Intro Typography Sequence
  setupIntroSequence() {
    const t1 = document.getElementById('text-1');
    const t2 = document.getElementById('text-2');
    const t3 = document.getElementById('text-3');
    const enterBtn = document.getElementById('enter-btn');
    const introContainer = document.getElementById('intro-view');
    const fadeOverlay = document.getElementById('fade-overlay');
    const header = document.getElementById('app-header');
    const nav = document.getElementById('app-nav');
    const explorationWidgets = document.getElementById('exploration-widgets');

    if (!t1 || !enterBtn) return;

    // Sequential text timing
    setTimeout(() => {
      t1.classList.remove('opacity-0', 'translate-y-4');
      t1.classList.add('opacity-100', 'translate-y-0');
    }, 400);

    setTimeout(() => {
      t1.classList.remove('opacity-100', 'translate-y-0');
      t1.classList.add('opacity-0', '-translate-y-4');

      t2.classList.remove('opacity-0', 'translate-y-4');
      t2.classList.add('opacity-100', 'translate-y-0');
    }, 2200);

    setTimeout(() => {
      t2.classList.remove('opacity-100', 'translate-y-0');
      t2.classList.add('opacity-0', '-translate-y-4');

      t3.classList.remove('opacity-0', 'translate-y-4');
      t3.classList.add('opacity-100', 'translate-y-0');

      setTimeout(() => {
        enterBtn.classList.remove('opacity-0', 'translate-y-8');
        enterBtn.classList.add('opacity-100', 'translate-y-0');
      }, 700);
    }, 4200);

    // Enter Universe CTA
    enterBtn.addEventListener('click', () => {
      if (this.audio) {
        this.audio.init();
        this.audio.playWarp();
      }

      // Hide intro
      introContainer.style.transition = 'opacity 1.2s ease-out, transform 1.2s ease-out';
      introContainer.style.opacity = '0';
      introContainer.style.transform = 'scale(0.95)';

      setTimeout(() => {
        introContainer.style.display = 'none';
        fadeOverlay.classList.add('opacity-0');

        // Reveal header & nav
        header.classList.remove('opacity-0', '-translate-y-full');
        nav.classList.remove('opacity-0', 'translate-y-full');
        if (explorationWidgets) {
          explorationWidgets.classList.remove('opacity-0', 'pointer-events-none');
        }

        // Start ambient music softly
        if (this.audio) {
          this.audio.startMusic();
          this.updateAudioIcon(true);
        }
      }, 800);
    });

    // Floating Stardust Particles
    const particles = document.getElementById('intro-particles');
    if (particles) {
      for (let i = 0; i < 24; i++) {
        const p = document.createElement('div');
        p.className = 'absolute rounded-full bg-primary/40 blur-[1px]';
        const size = Math.random() * 3.5 + 1.5;
        p.style.width = `${size}px`;
        p.style.height = `${size}px`;
        p.style.left = `${Math.random() * 100}%`;
        p.style.top = `${Math.random() * 100}%`;
        p.style.animation = `floatParticles ${Math.random() * 4 + 3}s ease-in-out ${Math.random() * 2}s infinite alternate`;
        particles.appendChild(p);
      }
    }
  }

  // 3. Navigation Tabs
  setupNavigation() {
    const navLinks = document.querySelectorAll('#app-nav a[data-path]');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const tab = link.getAttribute('data-path');
        this.switchTab(tab);
      });
    });
  }

  switchTab(tabName) {
    const normalizedTab = (tabName === 'achievements' || tabName === 'trophies') ? 'trophies' : tabName;
    this.currentTab = normalizedTab;
    if (this.audio) this.audio.playClick();

    // Update Nav Icons Styling
    document.querySelectorAll('#app-nav a[data-path]').forEach(link => {
      const linkPath = link.getAttribute('data-path');
      const isCurrent = (linkPath === normalizedTab) || (normalizedTab === 'trophies' && linkPath === 'achievements');
      link.classList.toggle('text-primary', isCurrent);
      link.classList.toggle('text-on-surface-variant', !isCurrent);
      if (isCurrent) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });

    // Toggle Tab Views
    const views = ['exploration-view', 'discoveries-view', 'music-view', 'trophies-view', 'finale-view'];
    views.forEach(v => {
      const el = document.getElementById(v);
      if (el) {
        if (v === `${normalizedTab}-view`) {
          el.classList.remove('hidden');
          requestAnimationFrame(() => {
            el.classList.remove('opacity-0');
            el.classList.add('opacity-100');
          });
        } else {
          el.classList.add('opacity-0');
          setTimeout(() => el.classList.add('hidden'), 200);
        }
      }
    });

    // If switching back to exploration, reset camera
    if (normalizedTab === 'exploration') {
      this.engine.resetCamera();
    } else if (normalizedTab === 'discoveries') {
      this.renderDiscoveries();
    } else if (normalizedTab === 'trophies') {
      this.renderTrophies();
    }
  }

  // 4. Header Actions (Audio, Ambient Mode, Customizer)
  setupHeaderActions() {
    const audioBtn = document.getElementById('audio-toggle-btn');
    if (audioBtn) {
      audioBtn.addEventListener('click', () => {
        if (this.audio) {
          const isPlaying = this.audio.toggleMusic();
          this.updateAudioIcon(isPlaying);
        }
      });
    }

    const vibeBtn = document.getElementById('vibe-toggle-btn');
    if (vibeBtn) {
      vibeBtn.addEventListener('click', () => {
        this.toggleAmbientMode();
      });
    }

    const exitVibeBtn = document.getElementById('exit-vibe-btn');
    if (exitVibeBtn) {
      exitVibeBtn.addEventListener('click', () => {
        this.toggleAmbientMode();
      });
    }

    const surpriseBtn = document.getElementById('surprise-me-btn');
    if (surpriseBtn) {
      surpriseBtn.addEventListener('click', () => {
        this.gameplay.surpriseMe((starData) => {
          this.openMemoryModal(starData);
        });
      });
    }

    const magicBtn = document.getElementById('magic-wand-btn');
    if (magicBtn) {
      magicBtn.addEventListener('click', () => {
        this.gameplay.surpriseMe((starData) => {
          this.openMemoryModal(starData);
        });
      });
    }

    // Modal favorite heart button
    const favBtn = document.getElementById('modal-fav-btn');
    if (favBtn) {
      favBtn.addEventListener('click', () => {
        if (!this.activeMemoryModal) return;
        const id = this.activeMemoryModal.id;
        if (this.favorites.has(id)) {
          this.favorites.delete(id);
          favBtn.classList.remove('text-red-400', 'fill-red-400');
          favBtn.classList.add('text-on-surface-variant');
        } else {
          this.favorites.add(id);
          favBtn.classList.add('text-red-400', 'fill-red-400');
          favBtn.classList.remove('text-on-surface-variant');
          if (this.audio) this.audio.playTwinkle();
        }
        localStorage.setItem('universe_favorites', JSON.stringify([...this.favorites]));
      });
    }
  }

  updateAudioIcon(isPlaying) {
    const icon = document.querySelector('#audio-toggle-btn .material-symbols-outlined');
    if (icon) {
      icon.innerText = isPlaying ? 'volume_up' : 'volume_off';
    }
  }

  toggleAmbientMode() {
    this.isAmbientMode = !this.isAmbientMode;
    const header = document.getElementById('app-header');
    const nav = document.getElementById('app-nav');
    const widgets = document.getElementById('exploration-widgets');
    const exitVibe = document.getElementById('exit-vibe-container');

    if (this.isAmbientMode) {
      header.classList.add('opacity-0', '-translate-y-full');
      nav.classList.add('opacity-0', 'translate-y-full');
      widgets.classList.add('opacity-0', 'pointer-events-none');
      exitVibe.classList.remove('hidden');
      this.gameplay.showToast('✦ Ambient Mode Active', 'Relax and enjoy floating through the cosmos.', 'spa');
    } else {
      header.classList.remove('opacity-0', '-translate-y-full');
      nav.classList.remove('opacity-0', 'translate-y-full');
      widgets.classList.remove('opacity-0', 'pointer-events-none');
      exitVibe.classList.add('hidden');
    }
  }

  // 5. Engine Callbacks & Hover Tooltip
  setupEngineCallbacks() {
    const tooltip = document.getElementById('star-tooltip');

    this.engine.onStarHover = (starData, screenX, screenY) => {
      if (starData && tooltip) {
        tooltip.innerHTML = `<span class="text-primary mr-1">✦</span> ${starData.tooltip || starData.title}`;
        tooltip.style.left = `${screenX}px`;
        tooltip.style.top = `${screenY}px`;
        tooltip.style.opacity = '1';
        if (this.audio) this.audio.playTwinkle();
      } else if (tooltip) {
        tooltip.style.opacity = '0';
      }
    };

    this.engine.onStarClick = (starData) => {
      if (starData.type === 'final') {
        this.triggerFinaleSequence();
      } else {
        this.engine.flyToStar(starData, () => {
          this.gameplay.discoverStar(starData);
          this.updateProgressBadge();
          this.openMemoryModal(starData);
        });
      }
    };

    this.engine.onMoonClick = () => {
      this.gameplay.handleMoonClick();
    };

    this.engine.onShootingStarClick = () => {
      this.gameplay.handleShootingStarCatch();
    };
  }

  updateProgressBadge() {
    const { count, total } = this.gameplay.getDiscoveryProgress();
    const badges = document.querySelectorAll('.discovery-count-text');
    badges.forEach(b => {
      b.innerText = `${count}/${total} discovered`;
    });
  }

  // 6. Memory Detail Modal (Polaroid View)
  openMemoryModal(starData) {
    const modal = document.getElementById('memory-modal');
    if (!modal) return;

    this.activeMemoryModal = starData;

    // Populate Fields
    document.getElementById('modal-title').innerText = starData.title;
    document.getElementById('modal-date').innerText = starData.date;
    document.getElementById('modal-desc').innerText = `"${starData.description}"`;
    document.getElementById('modal-footnote').innerText = starData.footnote || "psst... this one's important 💀";

    // Category Badge
    const tagEl = document.getElementById('modal-tag');
    if (tagEl) {
      tagEl.innerText = starData.tag.toUpperCase();
    }

    // Image / Artwork with graceful fallback
    const imgEl = document.getElementById('modal-image');
    if (imgEl) {
      imgEl.src = starData.image;
      imgEl.onerror = () => {
        imgEl.src = 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80';
      };
    }

    // Favorite heart icon state
    const favBtn = document.getElementById('modal-fav-btn');
    if (favBtn) {
      const isFav = this.favorites.has(starData.id);
      favBtn.classList.toggle('text-red-400', isFav);
      favBtn.classList.toggle('text-on-surface-variant', !isFav);
    }

    // Song info if music type
    const musicSection = document.getElementById('modal-music-section');
    if (musicSection) {
      if (starData.type === 'music') {
        musicSection.classList.remove('hidden');
        document.getElementById('modal-song-title').innerText = starData.song || "Starlight Melody";
        document.getElementById('modal-artist').innerText = starData.artist || "Cosmic Vibes";
      } else {
        musicSection.classList.add('hidden');
      }
    }

    // Show modal with smooth glass transition
    modal.classList.remove('hidden');
    requestAnimationFrame(() => {
      modal.classList.remove('opacity-0');
      modal.classList.add('opacity-100');
    });

    this.updateProgressBadge();
  }

  closeMemoryModal() {
    const modal = document.getElementById('memory-modal');
    if (!modal) return;

    modal.classList.add('opacity-0');
    setTimeout(() => {
      modal.classList.add('hidden');
      this.activeMemoryModal = null;
      this.engine.resetCamera();
    }, 300);
  }

  // Navigate to Next/Prev memory star
  navigateModal(direction = 1) {
    const stars = (window.UNIVERSE_DATA && window.UNIVERSE_DATA.stars) || [];
    if (!this.activeMemoryModal || stars.length === 0) return;

    const currentIndex = stars.findIndex(s => s.id === this.activeMemoryModal.id);
    let nextIndex = (currentIndex + direction + stars.length) % stars.length;
    if (stars[nextIndex].type === 'final') {
      nextIndex = (nextIndex + direction + stars.length) % stars.length;
    }

    const nextStar = stars[nextIndex];
    this.engine.flyToStar(nextStar, () => {
      this.gameplay.discoverStar(nextStar);
      this.openMemoryModal(nextStar);
    });
  }

  // 7. Discoveries Scrapbook Grid with Filtering
  renderDiscoveries() {
    const grid = document.getElementById('discoveries-grid');
    if (!grid) return;

    grid.innerHTML = '';
    const stars = (window.UNIVERSE_DATA && window.UNIVERSE_DATA.stars) || [];

    const filteredStars = stars.filter(s => {
      if (this.activeCategoryFilter === 'all') return true;
      return s.tag === this.activeCategoryFilter || s.type === this.activeCategoryFilter;
    });

    filteredStars.forEach(star => {
      const isDiscovered = this.gameplay.discoveredStars.has(star.id);
      const isFav = this.favorites.has(star.id);
      const card = document.createElement('div');
      card.className = `glass-card p-3 rounded-xl flex flex-col gap-2 transition-all duration-300 ${
        isDiscovered ? 'cursor-pointer hover:scale-[1.03] hover:border-primary/50' : 'opacity-45 grayscale'
      }`;

      card.innerHTML = `
        <div class="w-full aspect-[4/3] rounded-lg overflow-hidden relative bg-surface-variant">
          ${isDiscovered ? `
            <img src="${star.image}" class="w-full h-full object-cover" loading="lazy" />
            <div class="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-surface/85 backdrop-blur-md text-[10px] font-label-caps text-primary uppercase border border-white/10">
              ${star.tag}
            </div>
            ${isFav ? `<div class="absolute bottom-2 right-2 text-red-400 text-sm">❤️</div>` : ''}
          ` : `
            <div class="w-full h-full flex flex-col items-center justify-center gap-1 text-on-surface-variant">
              <span class="material-symbols-outlined text-[28px]">lock</span>
              <span class="font-label-caps text-[10px] uppercase">mystery star</span>
            </div>
          `}
        </div>
        <div class="flex flex-col px-1">
          <span class="font-headline-md text-[14px] text-on-surface truncate">${isDiscovered ? star.title : '??? Secret Star'}</span>
          <span class="font-label-caps text-[10px] text-primary uppercase tracking-wider">${isDiscovered ? star.date : 'Explore the cosmos to find'}</span>
        </div>
      `;

      if (isDiscovered) {
        card.addEventListener('click', () => {
          this.switchTab('exploration');
          this.engine.flyToStar(star, () => {
            this.openMemoryModal(star);
          });
        });
      }

      grid.appendChild(card);
    });
  }

  setCategoryFilter(category) {
    this.activeCategoryFilter = category;
    document.querySelectorAll('.cat-filter-btn').forEach(b => {
      const isActive = b.getAttribute('data-cat') === category;
      b.classList.toggle('bg-primary', isActive);
      b.classList.toggle('text-on-primary', isActive);
      b.classList.toggle('bg-surface-container', !isActive);
      b.classList.toggle('text-on-surface-variant', !isActive);
    });
    this.renderDiscoveries();
  }

  // 8. Trophies & Achievements
  renderTrophies() {
    const list = document.getElementById('trophies-list');
    if (!list) return;

    list.innerHTML = '';
    const achievements = (window.UNIVERSE_DATA && window.UNIVERSE_DATA.achievements) || [];

    achievements.forEach(a => {
      const isUnlocked = this.gameplay.unlockedAchievements.has(a.id);
      const item = document.createElement('div');
      item.className = `glass-card p-4 rounded-xl flex items-center gap-4 transition-all ${
        isUnlocked ? 'border-primary/40 bg-surface-container-low/70' : 'opacity-40 grayscale'
      }`;

      item.innerHTML = `
        <div class="w-12 h-12 rounded-full ${isUnlocked ? 'bg-primary/20 text-primary shadow-[0_0_15px_rgba(215,186,255,0.4)]' : 'bg-surface-variant text-on-surface-variant'} flex items-center justify-center flex-shrink-0">
          <span class="material-symbols-outlined text-[24px]">${a.icon || 'military_tech'}</span>
        </div>
        <div class="flex flex-col flex-1">
          <div class="flex items-center justify-between">
            <h4 class="font-headline-md text-[15px] text-on-surface">${a.title}</h4>
            <span class="font-label-caps text-[10px] ${isUnlocked ? 'text-primary' : 'text-on-surface-variant'} uppercase tracking-wider">
              ${isUnlocked ? '✦ unlocked' : 'locked'}
            </span>
          </div>
          <p class="font-body-sm text-[12px] text-on-surface/80 mt-0.5">${a.desc}</p>
        </div>
      `;

      list.appendChild(item);
    });
  }

  // 9. The Final Star Monologue Sequence
  triggerFinaleSequence() {
    this.switchTab('finale');

    const phrases = window.UNIVERSE_DATA.monologue;
    let currentIndex = 0;
    const textElement = document.getElementById('cinematic-text');
    const finalScreen = document.getElementById('final-screen');
    const goldenGlow = document.getElementById('golden-glow');
    const coreGlow = document.getElementById('core-glow');

    if (!textElement || !finalScreen) return;

    textElement.style.display = 'block';
    finalScreen.classList.add('hidden');
    finalScreen.classList.remove('flex');

    const showNextPhrase = () => {
      if (currentIndex >= phrases.length) {
        textElement.style.opacity = '0';
        textElement.style.transform = 'translateY(-10px)';

        setTimeout(() => {
          textElement.style.display = 'none';

          // Reveal final celebration screen
          finalScreen.classList.remove('hidden');
          finalScreen.classList.add('flex');

          // Expand glorious golden star glow
          if (goldenGlow) {
            goldenGlow.classList.remove('scale-100');
            goldenGlow.classList.add('scale-150');
          }
          if (coreGlow) {
            coreGlow.classList.remove('scale-100');
            coreGlow.classList.add('scale-150', 'opacity-80');
          }

          requestAnimationFrame(() => {
            finalScreen.style.opacity = '1';
            finalScreen.classList.remove('scale-95');
            finalScreen.classList.add('scale-100');
          });

          this.gameplay.unlockAchievement('cosmic_besties');
          if (this.audio) this.audio.playAchievement();
        }, 1000);
        return;
      }

      textElement.innerHTML = phrases[currentIndex];
      textElement.style.opacity = '1';
      textElement.style.transform = 'translateY(0)';

      const readingTime = phrases[currentIndex].length > 35 ? 3200 : 2400;

      this.monologueTimeout = setTimeout(() => {
        textElement.style.opacity = '0';
        textElement.style.transform = 'translateY(-10px)';
        currentIndex++;
        setTimeout(showNextPhrase, 900);
      }, readingTime);
    };

    setTimeout(showNextPhrase, 600);
  }

  replayUniverse() {
    if (this.monologueTimeout) clearTimeout(this.monologueTimeout);
    this.switchTab('exploration');
    this.engine.resetCamera();
    this.gameplay.showToast('✦ Welcome Back to the Cosmos', 'Explore new constellations and memories anytime.', 'explore');
  }
}

window.UniverseUI = UniverseUI;
