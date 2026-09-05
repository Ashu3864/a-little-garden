/**
 * "A Little Universe" - Centralized Universe Data
 * Data-driven registry for all 3D memory stars, constellations, achievements, and playlists.
 * Easily customizable by replacing placeholders.
 */

const UNIVERSE_DATA = {
  metadata: {
    title: "a little universe.",
    subtitle: "an immersive 3D best-friend experience",
    recipient: "YOUR_BESTIE_NAME",
    author: "YOUR_NAME",
    totalRequiredForFinal: 10 // discover 10 stars to unlock the Final Star
  },

  // 20+ Data-driven Memory Stars across 7 types
  stars: [
    {
      id: "star-01",
      type: "memory",
      tag: "memory",
      title: "THAT ONE DAY",
      date: "August 2024",
      position: [-3, -2, 7],
      color: 0xd7baff, // Lavender
      tooltip: "psst... click me 👀",
      image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80",
      description: "we genuinely had no idea this would become one of my favorite memories.",
      footnote: "psst... this one's important 💀",
      constellationId: "constellation-memories"
    },
    {
      id: "star-02",
      type: "appreciation",
      tag: "appreciation",
      title: "ALWAYS IN MY CORNER",
      date: "Every Single Day",
      position: [2.5, 1.5, 4.5],
      color: 0xffd700, // Gold
      tooltip: "a little note for you 💌",
      image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80",
      description: "thank you for being the person who always gets my jokes before i even finish telling them, and for never letting me overthink alone.",
      footnote: "certified ride-or-die forever 🌟",
      constellationId: "constellation-bestie"
    },
    {
      id: "star-03",
      type: "chaos",
      tag: "chaos",
      title: "THE 3AM INCIDENT",
      date: "Uncensored History",
      position: [5, -3.5, 3],
      color: 0xf9b3cc, // Blush Pink
      tooltip: "classified chaos 😭",
      image: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=800&q=80",
      description: "remember when we laughed so hard at nothing for 45 minutes straight until our stomachs hurt? literally peak chaotic energy.",
      footnote: "never letting you live this down 💀",
      constellationId: "constellation-chaos"
    },
    {
      id: "star-04",
      type: "secret",
      tag: "secret",
      title: "THE VAULT OF SECRETS",
      date: "Top Secret",
      position: [-6, 3, 2],
      color: 0xc5cd65, // Lime gold
      tooltip: "restricted access 🔒",
      image: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80",
      description: "all the unhinged voice notes, 2-hour phone calls about minor inconveniences, and screenshots we promised to delete immediately.",
      footnote: "would destroy us in court 🤫",
      constellationId: "constellation-secrets"
    },
    {
      id: "star-05",
      type: "music",
      tag: "soundtrack",
      title: "OUR OFFICIAL ANTHEM",
      date: "On Repeat Forever",
      position: [1, 5, -2],
      color: 0x87ceeb, // Sky Blue
      tooltip: "turn the volume up 🎵",
      song: "Golden Hour Memories",
      artist: "The Cosmic Duo",
      image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80",
      description: "the exact song that played in the car with the windows rolled down when the sky was lavender and everything felt infinite.",
      footnote: "screaming the lyrics off-key was mandatory 🎧",
      constellationId: "constellation-soundtrack"
    },
    {
      id: "star-06",
      type: "random",
      tag: "random",
      title: "RANDOM REALIZATION",
      date: "Out of Nowhere",
      position: [-4.5, -4, 1.5],
      color: 0xffb6c1, // Light Pink
      tooltip: "surprise insight ✨",
      image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80",
      description: "you are effortlessly iconic and the universe is objectively cooler because you are in it.",
      footnote: "scientifically peer-reviewed truth 🧪",
      constellationId: "constellation-chaos"
    },
    {
      id: "star-07",
      type: "memory",
      tag: "memory",
      title: "THAT COFFEE RUN",
      date: "October 2024",
      position: [6.5, 2, -1],
      color: 0xd7baff, // Lavender
      tooltip: "smells like iced lattes ☕",
      image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80",
      description: "we said we'd grab a quick 10-minute coffee and ended up talking for three and a half hours about life, the universe, and everything.",
      footnote: "best iced matcha of the year 🍵",
      constellationId: "constellation-memories"
    },
    {
      id: "star-08",
      type: "appreciation",
      tag: "appreciation",
      title: "YOUR SUPERPOWER",
      date: "Constant Fact",
      position: [-1.5, 3.5, 6],
      color: 0xffd700, // Gold
      tooltip: "pure truth ✨",
      image: "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&w=800&q=80",
      description: "your ability to make anyone feel heard, valued, and instantly relaxed is genuinely magical. never lose your warmth.",
      footnote: "one of the reasons you're my bestie 🫶",
      constellationId: "constellation-bestie"
    },
    {
      id: "star-09",
      type: "chaos",
      tag: "chaos",
      title: "THE RETAIL THERAPY EXPEDITION",
      date: "Financial Decisions Were Made",
      position: [3.5, -5, -4],
      color: 0xf9b3cc, // Blush Pink
      tooltip: "do not look at bank balance 💸",
      image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80",
      description: "'we're just looking, we're not buying anything' ... *leaves with three bags each and zero regrets*.",
      footnote: "it was an investment in joy tbh 🛍️",
      constellationId: "constellation-chaos"
    },
    {
      id: "star-10",
      type: "memory",
      tag: "memory",
      title: "STARGAZING ON THE HOOD OF THE CAR",
      date: "Summer Nights",
      position: [-7, -1, -3],
      color: 0x87ceeb, // Sky blue
      tooltip: "look up at the sky 🌌",
      image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
      description: "watching satellites drift past and talking about what we want our futures to look like. i'll never forget that quiet feeling.",
      footnote: "we made wishes on airplanes accidentally ✈️",
      constellationId: "constellation-memories"
    },
    {
      id: "star-11",
      type: "music",
      tag: "soundtrack",
      title: "MIDNIGHT DRIVE PLAYLIST",
      date: "Track 02",
      position: [4, 4.5, 2],
      color: 0xd7baff, // Lavender
      tooltip: "bass boost engaged 🎶",
      song: "Starlight Highway",
      artist: "Night Drive Collective",
      image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80",
      description: "windows fogged up, singing at the top of our lungs, taking the long way home just so the song wouldn't end.",
      footnote: "track volume: 100% 🔊",
      constellationId: "constellation-soundtrack"
    },
    {
      id: "star-12",
      type: "secret",
      tag: "secret",
      title: "THE TIME WE WON AT LIFE",
      date: "Legendary Win",
      position: [-2, -6, 4],
      color: 0xc5cd65, // Lime Gold
      tooltip: "undefeated era 🏆",
      image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80",
      description: "when everything went wrong and somehow we turned the entire mess into the funniest story of the year.",
      footnote: "plot armor level: 1000 🛡️",
      constellationId: "constellation-secrets"
    },
    {
      id: "star-13",
      type: "appreciation",
      tag: "appreciation",
      title: "NO EXPLANATION NEEDED",
      date: "Telepathy Status",
      position: [7, -1.5, 5],
      color: 0xffd700, // Gold
      tooltip: "the eye contact look 👀",
      image: "https://images.unsplash.com/photo-1494774157365-9e04c6720e47?auto=format&fit=crop&w=800&q=80",
      description: "the fact that we can exchange one single look across a crowded room and have a full 10-paragraph telepathic conversation.",
      footnote: "FBI could never decode us 🕵️",
      constellationId: "constellation-bestie"
    },
    {
      id: "star-14",
      type: "memory",
      tag: "memory",
      title: "THE SUNSET EXPEDITION",
      date: "Golden Hour",
      position: [-5.5, 4.5, -4],
      color: 0xf9b3cc, // Blush Pink
      tooltip: "purple skies 🌆",
      image: "https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?auto=format&fit=crop&w=800&q=80",
      description: "racing to the top of the hill before the sun dipped below the skyline just to take 200 blurry photos of each other.",
      footnote: "198 photos were blurry, 2 were masterpieces 📸",
      constellationId: "constellation-memories"
    },
    {
      id: "star-15",
      type: "music",
      tag: "soundtrack",
      title: "NOSTALGIA TAPE",
      date: "Side A",
      position: [0, -3.5, -6],
      color: 0x87ceeb, // Sky Blue
      tooltip: "press play 📼",
      song: "Cosmic Lavender Lullaby",
      artist: "Stardust Tape",
      image: "https://images.unsplash.com/photo-1487180144351-b8472da7d491?auto=format&fit=crop&w=800&q=80",
      description: "the soundtrack to late night study sessions, laughing fits, and planning trips we still haven't gone on yet.",
      footnote: "side B coming soon 📻",
      constellationId: "constellation-soundtrack"
    },
    {
      id: "star-16",
      type: "secret",
      tag: "secret",
      title: "EASTER EGG VAULT",
      date: "Found It!",
      position: [-8, 2, 4],
      color: 0xc5cd65, // Lime Gold
      tooltip: "you found a secret ⭐",
      image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
      description: "you're a certified snooper! you checked every corner of this little galaxy. here is a virtual high-five and a cosmic hug.",
      footnote: "achievement unlocked: pro snooper 🎖️",
      constellationId: "constellation-secrets"
    },
    {
      id: "star-17",
      type: "random",
      tag: "random",
      title: "DAILY AFFIRMATION",
      date: "Permanent Truth",
      position: [2, -2, -5],
      color: 0xffb6c1, // Light Pink
      tooltip: "reminder: you're great 💫",
      image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80",
      description: "whatever you're stressing about right now: take a deep breath. you got this, and even if it's messy, we will laugh about it later.",
      footnote: "i promise you 💜",
      constellationId: "constellation-bestie"
    },
    {
      id: "star-final",
      type: "final",
      tag: "final",
      title: "THE FINAL STAR",
      date: "The Center of the Universe",
      position: [0, 0, 0], // Center core
      color: 0xffd700, // Golden core
      tooltip: "✦ the center of the universe ✦",
      image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
      description: "the final star holds the key to the entire universe we built together.",
      footnote: "click to reveal the cinematic message 🌟",
      constellationId: "constellation-bestie"
    }
  ],

  // Constellations grouping stars together with visual 3D line connectors
  constellations: [
    {
      id: "constellation-memories",
      name: "The Golden Era",
      tagline: "Unforgettable moments etched into starlight",
      starIds: ["star-01", "star-07", "star-10", "star-14"],
      color: 0xd7baff, // Lavender glow
      reward: "Unlocked 'The Golden Era' Constellation badge & starry trail!"
    },
    {
      id: "constellation-bestie",
      name: "Soulmate Orbit",
      tagline: "The strongest gravity in the galaxy",
      starIds: ["star-02", "star-08", "star-13", "star-17", "star-final"],
      color: 0xffd700, // Golden glow
      reward: "Unlocked 'Soulmate Orbit' Constellation and cosmic halo!"
    },
    {
      id: "constellation-chaos",
      name: "Chaos & 3AM Energy",
      tagline: "Powered entirely by unhinged laughter",
      starIds: ["star-03", "star-06", "star-09"],
      color: 0xf9b3cc, // Blush pink glow
      reward: "Unlocked 'Chaos Energy' Constellation and spark fireworks!"
    },
    {
      id: "constellation-soundtrack",
      name: "Cosmic Jukebox",
      tagline: "Songs that turn memories into movies",
      starIds: ["star-05", "star-11", "star-15"],
      color: 0x87ceeb, // Sky blue glow
      reward: "Unlocked 'Cosmic Jukebox' Constellation and musical notes!"
    },
    {
      id: "constellation-secrets",
      name: "Vault of Whispers",
      tagline: "Classified files & inside lore",
      starIds: ["star-04", "star-12", "star-16"],
      color: 0xc5cd65, // Lime gold glow
      reward: "Unlocked 'Vault of Whispers' Constellation & golden key!"
    }
  ],

  // Achievements & Milestones
  achievements: [
    {
      id: "first_star",
      title: "First Star",
      desc: "Discovered your very first memory star in the galaxy.",
      icon: "star",
      unlocked: false
    },
    {
      id: "night_explorer",
      title: "Night Explorer",
      desc: "Explored and discovered 5 memories across the cosmos.",
      icon: "explore",
      unlocked: false
    },
    {
      id: "lore_keeper",
      title: "Certified Lore Keeper",
      desc: "Completed your first constellation connection.",
      icon: "auto_stories",
      unlocked: false
    },
    {
      id: "pro_snooper",
      title: "Professional Snooper",
      desc: "Found the hidden secret star in the outer rim.",
      icon: "lock_open",
      unlocked: false
    },
    {
      id: "moonstruck",
      title: "Moonstruck",
      desc: "Discovered the hidden secret on the crescent moon.",
      icon: "dark_mode",
      unlocked: false
    },
    {
      id: "shooting_star_catcher",
      title: "Stardust Catcher",
      desc: "Caught a shooting star in motion across the sky.",
      icon: "flare",
      unlocked: false
    },
    {
      id: "cosmic_besties",
      title: "Cosmic Besties",
      desc: "Unlocked the Final Star and completed the universe.",
      icon: "military_tech",
      unlocked: false
    }
  ],

  // Ambient synth track presets (Web Audio generative soundscapes)
  soundtracks: [
    {
      id: "track-1",
      title: "A Little Universe",
      artist: "Ambient Space Chords",
      mood: "Ethereal & Dreamy",
      duration: "Looping"
    },
    {
      id: "track-2",
      title: "Golden Hour Nostalgia",
      artist: "Lofi Celestial Bells",
      mood: "Warm & Reflective",
      duration: "Looping"
    },
    {
      id: "track-3",
      title: "Midnight Constellations",
      artist: "Piano & Stardust",
      mood: "Cozy & Peaceful",
      duration: "Looping"
    }
  ],

  // Cinematic Monologue Phrases for "The Final Star"
  monologue: [
    "every star here holds something.",
    "a memory.",
    "a joke.",
    "a tiny thing i appreciate about you.",
    "but honestly...",
    "the best part is that i got to make all of these memories with you."
  ]
};

// Export for module or global use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = UNIVERSE_DATA;
} else {
  window.UNIVERSE_DATA = UNIVERSE_DATA;
}
