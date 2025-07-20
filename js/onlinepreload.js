preload() {
    this.load.json('settings', 'settings.json');
    this.load.image('sky', 'https://raw.githubusercontent.com/2ndperbawa/birthdaygameassets/refs/heads/main/assets/bg2_edited.png');
    this.load.image('ground', 'https://raw.githubusercontent.com/2ndperbawa/birthdaygameassets/refs/heads/main/assets/tileset1.png');
    this.load.image('bgground', 'https://raw.githubusercontent.com/2ndperbawa/birthdaygameassets/refs/heads/main/assets/bgTilesset.png');
    this.load.image('chatBubble', 'https://raw.githubusercontent.com/2ndperbawa/birthdaygameassets/refs/heads/main/assets/Exclamation_mark2.png');
    this.load.image('house', 'https://raw.githubusercontent.com/2ndperbawa/birthdaygameassets/refs/heads/main/assets/house.png');
    this.load.image('city', 'https://raw.githubusercontent.com/2ndperbawa/birthdaygameassets/refs/heads/main/assets/city.png');
    this.load.image('dialogue_box', 'https://raw.githubusercontent.com/2ndperbawa/birthdaygameassets/refs/heads/main/assets/dialogue_box.png');
    this.load.image('riefky', 'https://raw.githubusercontent.com/2ndperbawa/birthdaygameassets/refs/heads/main/assets/riefky.png');
    this.load.image('cakeScene', 'https://raw.githubusercontent.com/2ndperbawa/birthdaygameassets/refs/heads/main/assets/cake_scene.png');
    this.load.image('clouds_0001', 'https://raw.githubusercontent.com/2ndperbawa/birthdaygameassets/refs/heads/main/assets/clouds/clouds_0001.png');
    this.load.image('clouds_0002', 'https://raw.githubusercontent.com/2ndperbawa/birthdaygameassets/refs/heads/main/assets/clouds/clouds_0002.png');
    this.load.image('clouds_0003', 'https://raw.githubusercontent.com/2ndperbawa/birthdaygameassets/refs/heads/main/assets/clouds/clouds_0003.png');
    this.load.image('clouds_0004', 'https://raw.githubusercontent.com/2ndperbawa/birthdaygameassets/refs/heads/main/assets/clouds/clouds_0004.png');
    this.load.audio('footstep', 'https://raw.githubusercontent.com/2ndperbawa/birthdaygameassets/main/sounds/walk.mp3');
    this.load.audio('bgm', 'https://raw.githubusercontent.com/2ndperbawa/birthdaygameassets/main/sounds/background_music.mp3');
    
    // --- Load Sound Effect ---
    this.load.audio('popsound', 'https://raw.githubusercontent.com/2ndperbawa/birthdaygameassets/main/sounds/beep.mp3');
    this.load.audio('typeSound', 'https://raw.githubusercontent.com/2ndperbawa/birthdaygameassets/main/sounds/typebeep2.mp3');  
    // --- End Sound Effect ---

    // --- Load Individual Player Frames ---
    // Load Idle Frames
    for (let i = 1; i <= 12; i++) { // Adjust end number (4) based on your files
        let frameNum = String(i).padStart(4, '0'); // Creates '0001', '0002', etc.
        this.load.image(`atin_idle_${frameNum}`, `https://raw.githubusercontent.com/2ndperbawa/birthdaygameassets/refs/heads/main/assets/atin_idle/atin2_${frameNum}.png`);
    }

    // Load Walking Right Frames
    for (let i = 1; i <= 8; i++) { // Adjust end number (6) based on your files
        let frameNum = String(i).padStart(4, '0');
        // Assuming walk frames are in a different folder or have a different prefix
        this.load.image(`atin_walk_${frameNum}`, `https://raw.githubusercontent.com/2ndperbawa/birthdaygameassets/refs/heads/main/assets/atin_walk/atin2_${frameNum}.png`);
    }
}