/**
 * "A Little Universe" - 3D Three.js Scene Engine
 * High-performance WebGL scene with planets, crescent moon, interactive memory stars,
 * 3D constellations, shooting stars, and smooth camera flight.
 */

class Universe3DEngine {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.scene = null;
    this.camera = null;
    this.renderer = null;

    // Groups
    this.universeGroup = null;
    this.starsGroup = null;
    this.constellationsGroup = null;
    this.planetsGroup = null;

    // Objects
    this.interactiveStars = [];
    this.constellationLines = {};
    this.shootingStars = [];
    this.moonMesh = null;
    this.backgroundStarMesh = null;

    // Interaction & Raycasting
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2(-999, -999);
    this.touchStartPos = { x: 0, y: 0 };
    this.targetRotation = new THREE.Vector2(0, 0);
    this.currentRotation = new THREE.Vector2(0, 0);
    this.hoveredObject = null;
    this.isDragging = false;

    // Camera Animation State
    this.cameraState = 'DEFAULT'; // 'DEFAULT', 'FLYING', 'FOCUSED', 'WARP'
    this.defaultCameraPos = new THREE.Vector3(0, 0, 16);
    this.targetCameraPos = new THREE.Vector3(0, 0, 16);
    this.cameraLookAt = new THREE.Vector3(0, 0, 0);
    this.targetLookAt = new THREE.Vector3(0, 0, 0);
    this.focusedStar = null;

    // Time & Animation
    this.clock = new THREE.Clock();
    this.time = 0;
    this.lastShootingStarSpawn = 0;

    // Callbacks
    this.onStarHover = null;
    this.onStarClick = null;
    this.onMoonClick = null;
    this.onShootingStarClick = null;

    this.init();
  }

  init() {
    if (!this.container) return;

    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    // Scene
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x0a0a1a, 0.035);

    // Camera
    this.camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    this.camera.position.copy(this.defaultCameraPos);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setClearColor(0x0b1326, 0);
    this.container.appendChild(this.renderer.domElement);

    // Master universe group
    this.universeGroup = new THREE.Group();
    this.scene.add(this.universeGroup);

    // Lighting
    this.setupLighting();

    // Cosmic Objects
    this.createBackgroundStars();
    this.createPlanets();
    this.createCrescentMoon();
    this.createInteractiveStars();
    this.createConstellations();

    // Event Listeners
    this.setupEventListeners();

    // Start Loop
    this.animate();
  }

  setupLighting() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    const goldPointLight = new THREE.PointLight(0xffd700, 1.2, 100);
    goldPointLight.position.set(5, 5, 8);
    this.scene.add(goldPointLight);

    const lavenderPointLight = new THREE.PointLight(0xd7baff, 0.8, 80);
    lavenderPointLight.position.set(-6, -4, 4);
    this.scene.add(lavenderPointLight);
  }

  // 1. Background Twinkling Starfield
  createBackgroundStars() {
    const starCount = 2800;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);

    const palette = [
      new THREE.Color(0xffffff),
      new THREE.Color(0xd7baff),
      new THREE.Color(0xf9b3cc),
      new THREE.Color(0x87ceeb),
      new THREE.Color(0xffd700)
    ];

    for (let i = 0; i < starCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 140;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 140;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 140;

      const col = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.08,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });

    this.backgroundStarMesh = new THREE.Points(geometry, material);
    this.scene.add(this.backgroundStarMesh);
  }

  // 2. Stylized Planets
  createPlanets() {
    this.planetsGroup = new THREE.Group();
    this.universeGroup.add(this.planetsGroup);

    // Planet 1: Lavender with Planetary Ring
    const p1Geo = new THREE.SphereGeometry(1.4, 32, 32);
    const p1Mat = new THREE.MeshPhongMaterial({
      color: 0x6a5acd,
      emissive: 0x483d8b,
      emissiveIntensity: 0.35,
      shininess: 90
    });
    const p1Mesh = new THREE.Mesh(p1Geo, p1Mat);
    p1Mesh.position.set(-9, 4.5, -12);

    // Lavender Ring
    const ringGeo = new THREE.RingGeometry(1.8, 2.6, 48);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xd7baff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2.5;
    ringMesh.rotation.y = Math.PI / 6;
    p1Mesh.add(ringMesh);
    this.planetsGroup.add(p1Mesh);

    // Planet 2: Blush Pink Planet
    const p2Geo = new THREE.SphereGeometry(0.9, 32, 32);
    const p2Mat = new THREE.MeshPhongMaterial({
      color: 0xffb6c1,
      emissive: 0xf9b3cc,
      emissiveIntensity: 0.3,
      shininess: 100
    });
    const p2Mesh = new THREE.Mesh(p2Geo, p2Mat);
    p2Mesh.position.set(11, -5.5, -16);
    this.planetsGroup.add(p2Mesh);

    // Planet 3: Sky Blue Planet
    const p3Geo = new THREE.SphereGeometry(0.6, 32, 32);
    const p3Mat = new THREE.MeshPhongMaterial({
      color: 0x87ceeb,
      emissive: 0x5fa8d3,
      emissiveIntensity: 0.4,
      shininess: 80
    });
    const p3Mesh = new THREE.Mesh(p3Geo, p3Mat);
    p3Mesh.position.set(6, 9, -7);
    this.planetsGroup.add(p3Mesh);

    this.planets = [p1Mesh, p2Mesh, p3Mesh];
  }

  // 3. Extruded 3D Crescent Moon
  createCrescentMoon() {
    const moonShape = new THREE.Shape();
    moonShape.absarc(0, 0, 1.2, 0, Math.PI * 2, false);
    const holePath = new THREE.Path();
    holePath.absarc(0.5, 0.1, 1.2, 0, Math.PI * 2, true);
    moonShape.holes.push(holePath);

    const moonGeo = new THREE.ExtrudeGeometry(moonShape, {
      depth: 0.15,
      bevelEnabled: true,
      bevelSegments: 4,
      bevelThickness: 0.08
    });

    const moonMat = new THREE.MeshPhongMaterial({
      color: 0xfffdd0,
      emissive: 0xffe4b5,
      emissiveIntensity: 0.6,
      shininess: 120
    });

    this.moonMesh = new THREE.Mesh(moonGeo, moonMat);
    this.moonMesh.position.set(-13, 10.5, -20);
    this.moonMesh.rotation.z = Math.PI / 3.8;
    this.moonMesh.userData = { type: 'moon', clickCount: 0 };
    this.scene.add(this.moonMesh);
  }

  // 4. Interactive Memory Stars
  createInteractiveStars() {
    this.starsGroup = new THREE.Group();
    this.universeGroup.add(this.starsGroup);
    this.interactiveStars = [];

    const starsData = (window.UNIVERSE_DATA && window.UNIVERSE_DATA.stars) || [];

    starsData.forEach((starData, index) => {
      const starWrapper = new THREE.Group();
      starWrapper.position.set(...starData.position);

      const isFinal = starData.type === 'final';
      const size = isFinal ? 0.65 : 0.35;

      // Primary Octahedron Mesh
      const geo = new THREE.OctahedronGeometry(size, 0);
      const mat = new THREE.MeshPhongMaterial({
        color: starData.color,
        emissive: starData.color,
        emissiveIntensity: isFinal ? 1.0 : 0.75,
        shininess: 120,
        wireframe: false
      });
      const starMesh = new THREE.Mesh(geo, mat);

      // Outer Wireframe Halo
      const haloGeo = new THREE.OctahedronGeometry(size * 1.35, 0);
      const haloMat = new THREE.MeshBasicMaterial({
        color: starData.color,
        wireframe: true,
        transparent: true,
        opacity: 0.35
      });
      const haloMesh = new THREE.Mesh(haloGeo, haloMat);
      starMesh.add(haloMesh);

      // Invisible enlarged hitbox for easy touch & clicking
      const hitGeo = new THREE.SphereGeometry(size * 2.8, 8, 8);
      const hitMat = new THREE.MeshBasicMaterial({ visible: false });
      const hitMesh = new THREE.Mesh(hitGeo, hitMat);
      hitMesh.userData = { starData, starIndex: index, wrapper: starWrapper, starMesh, haloMesh };
      starWrapper.add(hitMesh);
      starWrapper.add(starMesh);

      starWrapper.userData = {
        starData,
        starIndex: index,
        starMesh,
        haloMesh,
        hitMesh,
        baseScale: 1,
        discovered: false
      };

      this.starsGroup.add(starWrapper);
      this.interactiveStars.push(starWrapper);
    });
  }

  // 5. 3D Constellations Lines
  createConstellations() {
    this.constellationsGroup = new THREE.Group();
    this.universeGroup.add(this.constellationsGroup);
    this.constellationLines = {};

    const constellations = (window.UNIVERSE_DATA && window.UNIVERSE_DATA.constellations) || [];
    const starsData = (window.UNIVERSE_DATA && window.UNIVERSE_DATA.stars) || [];

    const starMap = {};
    starsData.forEach(s => {
      starMap[s.id] = new THREE.Vector3(...s.position);
    });

    constellations.forEach(c => {
      const points = [];
      for (let i = 0; i < c.starIds.length - 1; i++) {
        const p1 = starMap[c.starIds[i]];
        const p2 = starMap[c.starIds[i + 1]];
        if (p1 && p2) {
          points.push(p1, p2);
        }
      }

      if (points.length > 0) {
        const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
        const lineMat = new THREE.LineBasicMaterial({
          color: c.color,
          transparent: true,
          opacity: 0.2,
          blending: THREE.AdditiveBlending
        });
        const lineMesh = new THREE.LineSegments(lineGeo, lineMat);
        lineMesh.userData = { constellationId: c.id, completed: false };
        this.constellationsGroup.add(lineMesh);
        this.constellationLines[c.id] = lineMesh;
      }
    });
  }

  // Highlight constellation on completion
  setConstellationCompleted(constellationId, completed = true) {
    const line = this.constellationLines[constellationId];
    if (line) {
      line.userData.completed = completed;
      line.material.opacity = completed ? 0.85 : 0.2;
      line.material.needsUpdate = true;
    }
  }

  // Mark star as discovered visually
  setStarDiscovered(starId) {
    const starObj = this.interactiveStars.find(s => s.userData.starData.id === starId);
    if (starObj) {
      starObj.userData.discovered = true;
      starObj.userData.starMesh.material.emissiveIntensity = 1.0;
      starObj.userData.haloMesh.material.opacity = 0.8;
    }
  }

  // 6. Shooting Stars System
  spawnShootingStar() {
    const startX = (Math.random() - 0.5) * 40;
    const startY = 15 + Math.random() * 10;
    const startZ = -10 - Math.random() * 15;

    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(6);
    positions[0] = startX;
    positions[1] = startY;
    positions[2] = startZ;
    positions[3] = startX - 2.5;
    positions[4] = startY - 2.5;
    positions[5] = startZ;

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const mat = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    });

    const mesh = new THREE.Line(geo, mat);
    mesh.userData = {
      birth: this.time,
      lifespan: 1.8,
      velocity: new THREE.Vector3(-18, -16, 2)
    };

    this.scene.add(mesh);
    this.shootingStars.push(mesh);
  }

  // 7. Event Listeners & Interaction
  setupEventListeners() {
    window.addEventListener('resize', this.onWindowResize.bind(this));

    // Pointer move for parallax and raycasting
    window.addEventListener('pointermove', (e) => {
      this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

      // Parallax target
      if (this.cameraState === 'DEFAULT') {
        this.targetRotation.x = this.mouse.y * 0.08;
        this.targetRotation.y = this.mouse.x * 0.08;
      }

      this.checkRaycastHover(e);
    });

    // Pointer down / click
    window.addEventListener('pointerdown', (e) => {
      this.touchStartPos = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('pointerup', (e) => {
      const dist = Math.hypot(e.clientX - this.touchStartPos.x, e.clientY - this.touchStartPos.y);
      if (dist < 8) {
        this.handlePointerClick(e);
      }
    });
  }

  checkRaycastHover(event) {
    if (!this.interactiveStars.length || this.cameraState === 'FLYING') return;

    this.raycaster.setFromCamera(this.mouse, this.camera);

    // Collect hitboxes
    const hitMeshes = this.interactiveStars.map(s => s.userData.hitMesh);
    const intersects = this.raycaster.intersectObjects(hitMeshes, true);

    if (intersects.length > 0) {
      const hitObj = intersects[0].object.userData;
      if (this.hoveredObject !== hitObj) {
        this.hoveredObject = hitObj;
        document.body.style.cursor = 'pointer';

        // Notify UI for tooltip
        if (this.onStarHover) {
          const screenPos = this.toScreenCoords(intersects[0].point);
          this.onStarHover(hitObj.starData, screenPos.x, screenPos.y);
        }
      }
    } else {
      if (this.hoveredObject) {
        this.hoveredObject = null;
        document.body.style.cursor = 'default';
        if (this.onStarHover) {
          this.onStarHover(null);
        }
      }
    }
  }

  handlePointerClick(event) {
    // Only handle clicks when on canvas or main UI
    if (event.target.closest('button, nav, header, .modal-content, a')) return;

    this.raycaster.setFromCamera(this.mouse, this.camera);

    // 1. Check Moon click
    if (this.moonMesh) {
      const moonHits = this.raycaster.intersectObject(this.moonMesh);
      if (moonHits.length > 0) {
        if (this.onMoonClick) this.onMoonClick();
        return;
      }
    }

    // 2. Check Shooting Stars
    if (this.shootingStars.length > 0) {
      const shootingHits = this.raycaster.intersectObjects(this.shootingStars);
      if (shootingHits.length > 0) {
        if (this.onShootingStarClick) this.onShootingStarClick();
        return;
      }
    }

    // 3. Check Memory Stars
    const hitMeshes = this.interactiveStars.map(s => s.userData.hitMesh);
    const starHits = this.raycaster.intersectObjects(hitMeshes, true);

    if (starHits.length > 0) {
      const starObj = starHits[0].object.userData;
      if (this.onStarClick) {
        this.onStarClick(starObj.starData);
      }
    }
  }

  toScreenCoords(pos) {
    const vector = pos.clone().project(this.camera);
    return {
      x: ((vector.x + 1) * window.innerWidth) / 2,
      y: ((-vector.y + 1) * window.innerHeight) / 2
    };
  }

  // 8. Camera Navigation Methods
  flyToStar(starData, onComplete) {
    this.cameraState = 'FLYING';
    this.focusedStar = starData;

    const starPos = new THREE.Vector3(...starData.position);
    this.targetCameraPos.set(starPos.x, starPos.y + 0.3, starPos.z + 3.2);
    this.targetLookAt.copy(starPos);

    if (onComplete) {
      setTimeout(() => {
        this.cameraState = 'FOCUSED';
        onComplete();
      }, 1100);
    }
  }

  resetCamera(onComplete) {
    this.cameraState = 'FLYING';
    this.focusedStar = null;
    this.targetCameraPos.copy(this.defaultCameraPos);
    this.targetLookAt.set(0, 0, 0);

    setTimeout(() => {
      this.cameraState = 'DEFAULT';
      if (onComplete) onComplete();
    }, 1100);
  }

  onWindowResize() {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  // 9. Main Animation Loop
  animate() {
    requestAnimationFrame(this.animate.bind(this));

    const delta = this.clock.getDelta();
    this.time += delta;

    // Background drift
    if (this.universeGroup) {
      this.universeGroup.rotation.y += 0.0007;
    }
    if (this.backgroundStarMesh) {
      this.backgroundStarMesh.rotation.y -= 0.0003;
    }

    // Planet Rotations
    if (this.planets) {
      this.planets.forEach((p, idx) => {
        p.rotation.y += 0.004 * (idx + 1);
      });
    }

    // Moon gentle hover
    if (this.moonMesh) {
      this.moonMesh.rotation.z += Math.sin(this.time * 0.5) * 0.0002;
    }

    // Interactive Stars Pulse & Spin
    this.interactiveStars.forEach((starWrapper, idx) => {
      const { starMesh, haloMesh, starData } = starWrapper.userData;
      const isHovered = this.hoveredObject && this.hoveredObject.starData.id === starData.id;

      // Base gentle pulse
      const pulse = 1 + Math.sin(this.time * 2.5 + idx) * 0.08;
      const scale = isHovered ? 1.45 : (starWrapper.userData.discovered ? 1.15 * pulse : pulse);

      starMesh.scale.setScalar(scale);
      starMesh.rotation.y += 0.015;
      starMesh.rotation.x += 0.008;

      haloMesh.rotation.y -= 0.02;
      haloMesh.rotation.z += 0.01;
    });

    // Smooth Camera Interpolation
    if (this.cameraState === 'FLYING') {
      this.camera.position.lerp(this.targetCameraPos, 0.06);
      this.cameraLookAt.lerp(this.targetLookAt, 0.06);
      this.camera.lookAt(this.cameraLookAt);
    } else if (this.cameraState === 'DEFAULT') {
      // Parallax easing
      this.currentRotation.x += (this.targetRotation.x - this.currentRotation.x) * 0.05;
      this.currentRotation.y += (this.targetRotation.y - this.currentRotation.y) * 0.05;

      this.camera.position.x = this.defaultCameraPos.x + this.currentRotation.y * 3.5;
      this.camera.position.y = this.defaultCameraPos.y + this.currentRotation.x * 3.5;
      this.camera.lookAt(0, 0, 0);
    } else if (this.cameraState === 'FOCUSED') {
      // Subtle float while focused
      this.camera.position.y = this.targetCameraPos.y + Math.sin(this.time * 1.5) * 0.05;
      this.camera.lookAt(this.targetLookAt);
    }

    // Shooting Stars Update
    if (this.time - this.lastShootingStarSpawn > 9.0 + Math.random() * 8.0) {
      this.lastShootingStarSpawn = this.time;
      this.spawnShootingStar();
    }

    for (let i = this.shootingStars.length - 1; i >= 0; i--) {
      const comet = this.shootingStars[i];
      const age = this.time - comet.userData.birth;
      if (age > comet.userData.lifespan) {
        this.scene.remove(comet);
        this.shootingStars.splice(i, 1);
      } else {
        comet.position.addScaledVector(comet.userData.velocity, delta);
        comet.material.opacity = (1 - age / comet.userData.lifespan) * 0.9;
      }
    }

    this.renderer.render(this.scene, this.camera);
  }
}

window.Universe3DEngine = Universe3DEngine;
