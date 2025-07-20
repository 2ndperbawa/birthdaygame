class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.player = null;
        this.cursors = null;
        this.platforms = null;
        this.triggerZone = null;
        this.chatBubble = null;
        this.cityTriggerZone = null;
        this.cityImage = null;
        this.riefkyTriggerZone = null;
        this.riefkyImage = null;
        this.dialogueBox = null;
        this.dialogueTextObject = null;
        this.xKey = null;
        this.pressXText = null;
        this.typingTimer = null;
        this.dialogueActive = false;
        this.isTyping = false;
        this.dialogueContent = "";
        this.typingIndex = 0;
        this.footstepSoundInstance = null;
        this.characterImage = null;
        this.riefkyCharacterImage = null;
        this.fadeRect = null;
        this.cakeSceneImage = null;
        this.cakeSceneActive = false;
        this.isReady = false;
        this.cakeDialogueStage = 0;
        this.clouds = [];
        this.cloudWorldBoundsWidth = 0;
        this.settingsData = {};
        this.houseDialogue = "";
        this.cityDialogue = "";
        this.cakeDialogue1 = "";
        this.cakeDialogue2 = "";
    }

    preload() {
        this.load.json('settings', 'settings.json');
        this.load.image('sky', '/assets/bg2_edited.png');
        this.load.image('ground', '/assets/tileset1.png');
        this.load.image('bgground', '/assets/bgTilesset.png');
        this.load.image('chatBubble', '/assets/Exclamation_mark2.png');
        this.load.image('house', '/assets/house.png');
        this.load.image('city', '/assets/city.png');
        this.load.image('dialogue_box', '/assets/dialogue_box.png');
        this.load.image('riefky', '/assets/riefky.png');
        this.load.image('cakeScene', '/assets/cake_scene.png');
        this.load.image('clouds_0001', '/assets/clouds/clouds_0001.png');
        this.load.image('clouds_0002', '/assets/clouds/clouds_0002.png');
        this.load.image('clouds_0003', '/assets/clouds/clouds_0003.png');
        this.load.image('clouds_0004', '/assets/clouds/clouds_0004.png');
        this.load.audio('footstep', '/sounds/walk.mp3');
        this.load.audio('bgm', '/sounds/background_music.mp3');
        
        // --- Load Sound Effect ---
        this.load.audio('popsound', '/sounds/beep.mp3');
        this.load.audio('typeSound', '/sounds/typebeep2.mp3');  
        // --- End Sound Effect ---

        // --- Load Individual Player Frames ---
        // Load Idle Frames
        for (let i = 1; i <= 12; i++) { // Adjust end number (4) based on your files
            let frameNum = String(i).padStart(4, '0'); // Creates '0001', '0002', etc.
            this.load.image(`atin_idle_${frameNum}`, `/assets/atin_idle/atin2_${frameNum}.png`);
        }

        // Load Walking Right Frames
        for (let i = 1; i <= 8; i++) { // Adjust end number (6) based on your files
            let frameNum = String(i).padStart(4, '0');
            // Assuming walk frames are in a different folder or have a different prefix
            this.load.image(`atin_walk_${frameNum}`, `/assets/atin_walk/atin2_${frameNum}.png`);
        }
    }

    create() {
        this.settingsData = this.cache.json.get('settings');
        this.houseDialogue = this.settingsData.houseDialogue;
        this.cityDialogue = this.settingsData.cityDialogue;
        this.cakeDialogue1 = this.settingsData.cakeDialogue1;
        this.cakeDialogue2 = this.settingsData.cakeDialogue2;

        // Phaser's loader can handle both URLs and Base64 data URIs.
        this.load.image('atin_img', this.settingsData.atin_img);
        this.load.image('riefky_img', this.settingsData.riefky_img);

        this.load.start();
        this.load.once('complete', this.setupGame, this);
    }

    setupGame() {
        // Background
        const backgroundHeight = 650;
        const backgroundWidth = backgroundHeight * 1.5;
        this.createBackground(0, this.scale.height - 60, 'sky', backgroundWidth, backgroundHeight);
        this.createBackground(backgroundWidth, this.scale.height+50, 'sky', backgroundWidth, backgroundHeight);

        // --- Calculate World Width (needed for clouds and camera bounds) ---
        const cloudVisualHeight = 180;
        const cloudVisualWidth = cloudVisualHeight * 5.25;
        // Calculate total width based on cloud placement logic
        this.cloudWorldBoundsWidth = ((cloudVisualWidth - 75) * 3) + cloudVisualWidth - 35; // Width based on 4 ground tiles placement
        // --- End World Width Calculation ---

        this.platforms = this.physics.add.staticGroup();

        // --- START BACKGROUND MUSIC ---
        //Check if music is already playing (prevents duplicates on potential scene restarts)
        if (!this.sound.get('bgm') || !this.sound.get('bgm').isPlaying) {
            this.sound.play('bgm', {
                loop: true,
                volume: 0.3 // Adjust volume (0 to 1)
            });
        }
        // --- END BACKGROUND MUSIC ---

        // Grounds
        const groundVisualHeight = 180;
        const groundVisualWidth = groundVisualHeight * 5.25;
        const groundColliderWidth = groundVisualWidth;
        const groundColliderHeight = 50;
        const bgGroundHeight = groundVisualHeight + 50; // Calculate desired height

        for (let index = 0; index < 4; index++) {
          const firstOffset = index == 0 ? -35 : -2;
          const xposition = ((groundVisualWidth - 75) * index) + firstOffset;
          const bgxposition = ((groundVisualWidth - 78) * index) + firstOffset;
          this.createGround(xposition, this.scale.height+10, 'ground', groundVisualWidth, groundVisualHeight, 6);      
          this.createBgGround(bgxposition, this.scale.height - 8, 'bgground', groundVisualWidth, bgGroundHeight, 1 );
        }

        // --- Create Trigger Zone ---
        const zoneX = 600;
        const zoneY = this.scale.height - 200; // Adjusted Y slightly higher for house base
        const zoneWidth = 150 * 0.6;
        const zoneHeight = 200 * 0.6;

        // 1. Create the Zone using this.add.zone
        this.triggerZone = this.add.zone(zoneX, zoneY, zoneWidth, zoneHeight);
        this.triggerZone.setOrigin(0.5); // Zone origin is center

        // 2. Enable physics for the Zone
        this.physics.world.enable(this.triggerZone);

        // 3. Configure the physics body
        this.triggerZone.body.setAllowGravity(false);
        this.triggerZone.body.setImmovable(true);

        // --- Add House Image matching Trigger Zone ---
        const houseImage = this.add.image(zoneX, zoneY, 'house'); // Use same X, Y as zone
        houseImage.setOrigin(0.5); // Use same center origin as zone
        houseImage.displayWidth = zoneWidth; // Match zone's width
        houseImage.displayHeight = zoneHeight; // Match zone's height
        houseImage.setDepth(0); // Set rendering depth (e.g., behind player, in front of bgground)
        houseImage.setScrollFactor(0.9);
        // --- End House Image ---

        // --- Create City Trigger Zone & Image ---
        const cityZoneX = 1900; // Example: Place further right
        const cityZoneY = this.scale.height - 150; // Example: Center Y slightly higher
        const cityZoneWidth = 307; // Example: Wider than house
        const cityZoneHeight = 201; // Example: Taller than house

        // 1. Create the Zone
        this.cityTriggerZone = this.add.zone(cityZoneX+150, cityZoneY, cityZoneWidth, cityZoneHeight);
        this.cityTriggerZone.setOrigin(0.5); // Center origin

        // 2. Enable physics
        this.physics.world.enable(this.cityTriggerZone);

        // 3. Configure the physics body
        this.cityTriggerZone.body.setAllowGravity(false);
        this.cityTriggerZone.body.setImmovable(true);

        // 4. Add City Image matching Trigger Zone
        this.cityImage = this.add.image(cityZoneX, cityZoneY-70, 'city'); // Use same X, Y
        this.cityImage.setOrigin(0.5); // Use same center origin
        this.cityImage.displayWidth = cityZoneWidth; // Match zone width
        this.cityImage.displayHeight = cityZoneHeight; // Match zone height
        this.cityImage.setDepth(0); // Example depth (behind player, in front of house/bgground)
        this.cityImage.setScrollFactor(0.9);
        // cityImage.setScrollFactor(1); // Default, scrolls with world. Add parallax if needed.
        // --- End City Zone ---

        // --- Create Riefky Trigger Zone & Image ---
        const riefkyZoneX = 2750; // Example: Place further right than city
        const riefkyZoneY = this.scale.height - 230; // Example: Y position
        const riefkyZoneWidth = 265; // Example: Size
        const riefkyZoneHeight = 265; // Example: Size

        // 1. Create the Zone
        this.riefkyTriggerZone = this.add.zone(riefkyZoneX, riefkyZoneY, riefkyZoneWidth, riefkyZoneHeight);
        this.riefkyTriggerZone.setOrigin(0.5); // Center origin

        // 2. Enable physics
        this.physics.world.enable(this.riefkyTriggerZone);

        // 3. Configure the physics body
        this.riefkyTriggerZone.body.setAllowGravity(false);
        this.riefkyTriggerZone.body.setImmovable(true);

        // 4. Add Riefky Image matching Trigger Zone
        this.riefkyImage = this.add.image(riefkyZoneX, riefkyZoneY, 'riefky'); // Use same X, Y
        this.riefkyImage.setOrigin(0.5); // Use same center origin
        this.riefkyImage.displayWidth = riefkyZoneWidth; // Match zone width
        this.riefkyImage.displayHeight = riefkyZoneHeight; // Match zone height
        this.riefkyImage.setDepth(2); // Example depth (same as city?)
        // riefkyImage.setScrollFactor(1); // Default, scrolls with world. Add parallax if needed.
        // --- End Riefky Zone ---

        // --- End Trigger Zone ---

        // --- Player Creation ---
        this.player = this.physics.add.sprite(50, 200, 'atin_idle_0001');
        this.player.setDepth(5);

        // --- Player Collider Resizing ---
        const playerColliderWidth = 60;
        const playerColliderHeight = 200;
        this.player.body.setSize(playerColliderWidth, playerColliderHeight);
        this.player.body.setOffset(90, 27);
        this.player.setBounce(0.0).setCollideWorldBounds(true);

        // --- Define Player Animations using Frame Keys ---
        let idleFrames = [];
        for (let i = 1; i <= 12; i++) { // Match the end number from preload
            let frameNum = String(i).padStart(4, '0');
            idleFrames.push({ key: `atin_idle_${frameNum}` }); // Push object with correct key
        }
        this.anims.create({
            key: 'turn',
            frames: idleFrames, // Use the generated array of frame objects
            frameRate: 10,
            repeat: -1
        });

        // --- CORRECTED Walking Right Animation ('right') ---
        let walkFrames = [];
        for (let i = 1; i <= 8; i++) { // Match the end number from preload
            let frameNum = String(i).padStart(4, '0');
            walkFrames.push({ key: `atin_walk_${frameNum}` }); // Push object with correct key
        }
        this.anims.create({
            key: 'right',
            frames: walkFrames, // Use the generated array of frame objects
            frameRate: 14,
            repeat: -1
        });
        // --- End Animation Definition ---

        // --- Create Chat Bubble (Initially Hidden) ---
        this.chatBubble = this.add.image(0, 0, 'chatBubble'); // Position updated in update()
        this.chatBubble.displayWidth = 35;
        this.chatBubble.displayHeight = 35;
        this.chatBubble.setOrigin(0.5, 1); // Bottom-center origin
        this.chatBubble.setDepth(7); // Above player, below dialogue box
        this.chatBubble.setVisible(false);
        this.chatBubble.setScrollFactor(0); // Fixed to screen
        // --- End Chat Bubble ---

        // --- Create "Press X" Text (Initially Hidden) ---
        this.pressXText = this.add.text(20, 20, 'Tekan X', { // Position top-left (adjust padding)
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#ffffff', // White text
            stroke: '#000000', // Black outline
            strokeThickness: 4
        });
        this.pressXText.setDepth(9); // Below dialogue box (10/11), above most other things
        this.pressXText.setScrollFactor(0); // Fixed to screen
        this.pressXText.setVisible(false); // Start hidden
        // --- End "Press X" Text ---

        // --- Create Dialogue Box and Text (Initially Hidden) ---
        // Position near bottom-center of the screen
        const dialogueBoxX = this.scale.width / 2;
        const dialogueBoxY = this.scale.height - 30; // Adjust Y offset from bottom
        const dialogueBoxWidth = this.scale.width * 0.7; // 80% of screen width
        const dialogueBoxHeight = 150; // Adjust height as needed

        this.dialogueBox = this.add.image(dialogueBoxX, dialogueBoxY, 'dialogue_box');
        this.dialogueBox.setOrigin(0.5, 1); // Origin bottom-center
        this.dialogueBox.displayWidth = dialogueBoxWidth;
        this.dialogueBox.displayHeight = dialogueBoxHeight;
        this.dialogueBox.setDepth(22); // High depth, on top of everything
        this.dialogueBox.setScrollFactor(0); // Fixed to screen
        this.dialogueBox.setVisible(false);

        // Text object - position relative to the box
        const characterImageWidthEstimate = 120; // Estimate width the character image will take up
        const textPaddingLeft = 30 + characterImageWidthEstimate; // Add character width to left padding
        const textX = dialogueBoxX - dialogueBoxWidth / 2 + textPaddingLeft; // Padding from left edge, after image space
        const textY = dialogueBoxY - dialogueBoxHeight + 30; // Padding from top edge
        const textWrapWidth = dialogueBoxWidth - textPaddingLeft - 30; // Wrap width less left and right padding

        this.dialogueTextObject = this.add.text(textX, textY, '', {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#000000',
            wordWrap: { width: textWrapWidth, useAdvancedWrap: true }
        });
        this.dialogueTextObject.setDepth(23); // Above the dialogue box
        this.dialogueTextObject.setScrollFactor(0); // Fixed to screen
        this.dialogueTextObject.setVisible(false);

        // --- Add Character Image ---
        // Position near the top-left corner of the dialogue box
        const charImageX = dialogueBoxX - dialogueBoxWidth / 2 + 70; // Adjust X position (padding from left edge)
        const charImageY = dialogueBoxY - dialogueBoxHeight / 2 - 40; // Adjust Y position (vertically centered-ish)

        this.characterImage = this.add.image(charImageX, charImageY, 'atin_img');
        this.characterImage.setOrigin(0.5); // Center origin is fine
        this.characterImage.setScale(0.35); // Scale down the image (adjust as needed)
        this.characterImage.setDepth(23); // Same level as text, or 12 to be on top
        this.characterImage.setScrollFactor(0); // Fixed to screen
        this.characterImage.setVisible(false); // Start hidden
        // --- End Character Image ---

        // --- Add Riefky Character Image ---
        // Position near the top-left corner of the dialogue box (same as Atin's)
        this.riefkyCharacterImage = this.add.image(charImageX, charImageY, 'riefky_img'); // Use riefky_img key
        this.riefkyCharacterImage.setOrigin(0.5);
        this.riefkyCharacterImage.setScale(0.35); // Use same scale/size as Atin's image? Adjust if needed.
        this.riefkyCharacterImage.setDepth(23); // Same level as text
        this.riefkyCharacterImage.setScrollFactor(0); // Fixed to screen
        this.riefkyCharacterImage.setVisible(false); // Start hidden
        // --- End Riefky Character Image ---

        // --- End Dialogue Box ---

        // --- Create Fade Rectangle (Initially Transparent) ---
        this.fadeRect = this.add.rectangle(
            0, 0, // Top-left corner
            this.scale.width, this.scale.height, // Full screen size
            0xffffff // White color
        );
        this.fadeRect.setOrigin(0, 0); // Origin top-left
        this.fadeRect.setDepth(20); // High depth, above everything else
        this.fadeRect.setAlpha(0); // Start transparent
        this.fadeRect.setScrollFactor(0); // Fixed to screen
        // --- End Fade Rectangle ---

        // --- Create Cake Scene Image (Initially Hidden/Transparent) ---
        this.cakeSceneImage = this.add.image(
            this.scale.width / 2, this.scale.height / 2, // Center screen
            'cakeScene'
        );
        let cakeSceneImageHeight = 700;
        this.cakeSceneImage.displayWidth = cakeSceneImageHeight * 1.5;
        this.cakeSceneImage.displayHeight = cakeSceneImageHeight;
        this.cakeSceneImage.setOrigin(0.5); // Center origin
        // Optional: Resize cake scene image if needed
        // this.cakeSceneImage.setDisplaySize(this.scale.width * 0.8, this.scale.height * 0.8);
        this.cakeSceneImage.setDepth(21); // Above the white fade rectangle
        this.cakeSceneImage.setAlpha(0); // Start transparent
        this.cakeSceneImage.setVisible(false); // Start hidden (optional, alpha 0 does this too)
        this.cakeSceneImage.setScrollFactor(0); // Fixed to screen
        // --- End Cake Scene Image ---

        // --- Colliders and Input ---
        this.physics.add.collider(this.player, this.platforms);
        this.cursors = this.input.keyboard.createCursorKeys();
        this.xKey = this.input.keyboard.addKey('X');

        // --- Overlap Detection ---
        // Call playerEntersZone when player overlaps triggerZone
        this.physics.add.overlap(this.player, this.triggerZone, this.playerEntersZone, null, this);
        this.physics.add.overlap(this.player, this.cityTriggerZone, this.playerEntersCityZone, null, this);
        this.physics.add.overlap(this.player, this.riefkyTriggerZone, this.playerEntersRiefkyZone, null, this); // <-- ADDED Riefky zone overlap
        // --- End Overlap Detection ---

        // --- CAMERA SETUP ---
        const worldBoundsWidth = (groundVisualWidth - 30) + groundVisualWidth + groundVisualWidth; // Approx 1860
        this.cameras.main.setBounds(0, 0, worldBoundsWidth + 30, this.scale.height); // Add back the 30 offset for width
        // Also set physics world bounds if player shouldn't go beyond camera bounds
        this.physics.world.setBounds(0, 0, worldBoundsWidth + 130, this.scale.height);


        // 2. Make Camera Follow Player
        // startFollow(target, roundPixels, lerpX, lerpY)
        // lerpX/Y control the smoothness (0 = no follow, 1 = instant, 0.1 is smooth)
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

        // 3. Set Camera Zoom
        // 1 = default, > 1 zooms in, < 1 zooms out
        this.cameras.main.setZoom(1); // Example: Zoom in 1.5 times

        // --- END CAMERA SETUP ---
        this.isReady = true;
    }


    update() {
        if (!this.isReady) return;

        // --- Move and Wrap Clouds ---
        // clouds.forEach(cloud => {
        //     cloud.x += cloud.speed; // Move the cloud based on its speed

        //     // Check if the cloud's left edge has gone past the right edge of the world bounds
        //     const cloudLeftEdge = cloud.x - (cloud.displayWidth * cloud.originX * cloud.scaleX); // Adjust for origin and scale
        //     if (cloudLeftEdge > this.cloudWorldBoundsWidth) {
        //         // Reset position to the far left, just off-screen
        //         cloud.x = -(cloud.displayWidth * (1 - cloud.originX) * cloud.scaleX);
        //         // Optional: Randomize Y position slightly for variety when wrapping
        //         // cloud.y = Phaser.Math.Between(50, 200); // Adjust Y range as needed based on your cloudData in create()
        //     }
        // });
        // --- End Cloud Movement ---

        // --- Check Overlaps ---
        const isOverlappingHouse = this.physics.overlap(this.player, this.triggerZone);
        const isOverlappingCity = this.physics.overlap(this.player, this.cityTriggerZone);
        const isOverlappingRiefky = this.physics.overlap(this.player, this.riefkyTriggerZone); // <-- ADDED Riefky check
        const isOverlappingAnyZone = isOverlappingHouse || isOverlappingCity || isOverlappingRiefky; // <-- UPDATED combined check
        // --- End Check Overlaps ---

        const xKeyPressed = Phaser.Input.Keyboard.JustDown(this.xKey); // Check if X was just pressed

        // --- "Press X" Text Logic ---
        if (this.pressXText) {
            // Show if overlapping ANY zone AND dialogue/cake scene is not active
            if (isOverlappingAnyZone && !this.dialogueActive && !this.cakeSceneActive) {
                if (!this.pressXText.visible) { this.pressXText.setVisible(true); }
            } else {
                if (this.pressXText.visible) { this.pressXText.setVisible(false); }
            }
        }
        // --- End "Press X" Text Logic ---

        // --- Chat Bubble Logic ---
        if (this.chatBubble && this.player) {
             // Show if overlapping ANY zone AND dialogue/cake scene is not active
            if (isOverlappingAnyZone && !this.dialogueActive && !this.cakeSceneActive) {
                 if (!this.chatBubble.visible) {
                     this.sound.play('popsound', { volume: 0.9 });
                     this.chatBubble.setVisible(true);
                 }
                 // Update bubble position ...
                 const playerScreenX = this.player.x - this.cameras.main.scrollX;
                 const playerScreenY = this.player.y - this.cameras.main.scrollY;
                 this.chatBubble.x = playerScreenX - 5;
                 this.chatBubble.y = playerScreenY - (this.player.body.height / 2 / this.cameras.main.zoom) + 0;
            } else {
                if (this.chatBubble.visible) { this.chatBubble.setVisible(false); }
            }
        }
        // --- End Chat Bubble Logic ---

        //----------------------------------

        // --- Dialogue / Scene Interaction Logic ---
        if (xKeyPressed) {
            if (this.cakeSceneActive) {
                // --- Interact WITHIN Cake Scene ---
                switch (this.cakeDialogueStage) {
                    case 0: // Scene visible, first X press -> show first dialogue
                        console.log("Cake Scene: Show Dialogue 1");
                        this.dialogueContent = this.cakeDialogue1;
                        this.dialogueTextObject.setText('');
                        this.characterImage.setVisible(false); // Hide Atin's image
                        this.riefkyCharacterImage.setVisible(true); // Show Riefky's image
                        this.dialogueBox.setVisible(true);
                        this.dialogueTextObject.setVisible(true);

                        this.isTyping = true;
                        this.typingIndex = 0;
                        if (this.typingTimer) this.typingTimer.remove();
                        this.typingTimer = this.time.addEvent({
                            delay: 40,
                            callback: this.typeDialogueCharacter,
                            callbackScope: this,
                            loop: true
                        });
                        this.cakeDialogueStage = 1; // Move to next stage
                        break;

                    case 1: // First dialogue shown/typing, second X press -> skip/show second dialogue
                        if (this.isTyping) {
                            // Skip typing first dialogue
                            console.log("Cake Scene: Skip Dialogue 1 Typing");
                            this.isTyping = false;
                            if (this.typingTimer) this.typingTimer.remove();
                            this.typingTimer = null;
                            this.dialogueTextObject.setText(this.dialogueContent);
                            this.typingIndex = this.dialogueContent.length;
                            // Stage remains 1, next X press will trigger case 1 again (but !isTyping)
                        } else {
                            // Show second dialogue
                            console.log("Cake Scene: Show Dialogue 2");
                            this.dialogueContent = this.cakeDialogue2;
                            this.dialogueTextObject.setText('');
                            // Riefky image is already visible

                            this.isTyping = true;
                            this.typingIndex = 0;
                            if (this.typingTimer) this.typingTimer.remove();
                            this.typingTimer = this.time.addEvent({
                                delay: 40,
                                callback: this.typeDialogueCharacter,
                                callbackScope: this,
                                loop: true
                            });
                            this.cakeDialogueStage = 2; // Move to next stage
                        }
                        break;

                    case 2: // Second dialogue shown/typing, third X press -> skip/exit scene
                        if (this.isTyping) {
                            // Skip typing second dialogue
                            console.log("Cake Scene: Skip Dialogue 2 Typing");
                            this.isTyping = false;
                            if (this.typingTimer) this.typingTimer.remove();
                            this.typingTimer = null;
                            this.dialogueTextObject.setText(this.dialogueContent);
                            this.typingIndex = this.dialogueContent.length;
                            // Stage remains 2, next X press will trigger case 2 again (but !isTyping)
                        } else {
                            // --- Exit Cake Scene ---
                            console.log("Exiting Cake Scene");
                            // Hide dialogue elements first
                            this.dialogueBox.setVisible(false);
                            this.dialogueTextObject.setVisible(false);
                            this.riefkyCharacterImage.setVisible(false);

                            // Start fade out cake image
                            this.tweens.add({
                                targets: this.cakeSceneImage,
                                alpha: 0,
                                duration: 500,
                                ease: 'Power2',
                                onComplete: () => {
                                    this.cakeSceneImage.setVisible(false);
                                    // Start fade out white rectangle
                                    this.tweens.add({
                                        targets: this.fadeRect,
                                        alpha: 0,
                                        duration: 500,
                                        ease: 'Power2',
                                        onComplete: () => {
                                            this.cakeSceneActive = false; // Deactivate scene state
                                            this.cakeDialogueStage = 0; // RESET stage for next time
                                            this.player.body.enable = true; // Re-enable player
                                            console.log("Cake Scene finished");
                                        }
                                    });
                                }
                            });
                        }
                        break;
                } // End switch
            } else if (this.dialogueActive) {
                // --- Interact with Active Dialogue ---
                if (this.isTyping) {
                    // --- Skip Typing ---
                    console.log("Skipping Typing");
                    this.isTyping = false;
                    if (this.typingTimer) this.typingTimer.remove();
                    this.typingTimer = null;
                    this.dialogueTextObject.setText(this.dialogueContent);
                    this.typingIndex = this.dialogueContent.length;
                } else {
                    // --- Close Dialogue ---
                    this.dialogueActive = false;
                    this.isTyping = false;
                    this.dialogueBox.setVisible(false);
                    this.dialogueTextObject.setVisible(false);
                    // Re-enable player movement
                    this.player.body.enable = true;
                    this.dialogueBox.setVisible(false);
                    this.dialogueTextObject.setVisible(false);
                    this.characterImage.setVisible(false);
                }
            } else if (isOverlappingRiefky) {
                // --- Start Cake Scene ---
                console.log("Starting Cake Scene");
                this.cakeSceneActive = true; // Activate scene state
                this.player.body.enable = false; // Disable player
                this.player.setVelocity(0);
                this.player.anims.play('turn', true);
                this.chatBubble.setVisible(false); // Hide UI
                this.pressXText.setVisible(false);

                // Start fade in white rectangle
                this.tweens.add({
                    targets: this.fadeRect,
                    alpha: 1,
                    duration: 700, // Fade in duration
                    ease: 'Power2',
                    onComplete: () => { // When white rect is fully visible...
                        this.cakeSceneImage.setAlpha(0); // Ensure cake starts transparent
                        this.cakeSceneImage.setVisible(true); // Make cake image visible
                        // Start fade in cake image
                        this.tweens.add({
                            targets: this.cakeSceneImage,
                            alpha: 1,
                            duration: 1000, // Fade in duration
                            ease: 'Power2'
                        });
                    }
                });

            } else if (isOverlappingHouse || isOverlappingCity) {
                // --- Start Regular Dialogue ---
                let textToDisplay = isOverlappingHouse ? this.houseDialogue : this.cityDialogue;
                console.log("Starting Dialogue");
                this.dialogueActive = true;
                 this.isTyping = true;
                 this.typingIndex = 0;
                 this.dialogueContent = textToDisplay;
                 this.dialogueTextObject.setText('');
                 this.dialogueBox.setVisible(true);
                 this.dialogueTextObject.setVisible(true);
                 this.characterImage.setVisible(true);
                 this.chatBubble.setVisible(false);
                 this.pressXText.setVisible(false);
                 this.player.body.enable = false;
                 this.player.setVelocity(0);
                 this.player.anims.play('turn', true);
                 this.sound.play('popsound', { volume: 0.9 });
                 if (this.typingTimer) this.typingTimer.remove();
                 this.typingTimer = this.time.addEvent({
                    delay: 40, // Milliseconds between characters (adjust speed)
                    callback: this.typeDialogueCharacter,
                    callbackScope: this,
                    loop: true
                 });
            }
        }
        // --- End Dialogue / Scene Interaction Logic ---


        // --- Player Movement, Animation & Sound (Only if dialogue is NOT active) ---
        if (!this.dialogueActive) {
            const isOnGround = this.player.body.touching.down; // Check if player is on the ground

            // --- Player Input ---
            if (this.cursors.left.isDown) {
                this.player.setVelocityX(-260);
                this.player.setFlipX(true);
                this.player.anims.play('right', true);
            } else if (this.cursors.right.isDown) {
                this.player.setVelocityX(260);
                this.player.setFlipX(false);
                this.player.anims.play('right', true);
            } else {
                this.player.setVelocityX(0);
                this.player.anims.play('turn', true);
            }

            // Jumping logic
            if (this.cursors.up.isDown && isOnGround) {
                this.player.setVelocityY(-150);
            }

            // --- Footstep Sound Logic ---
            const isMovingHorizontally = this.player.body.velocity.x !== 0;

            if (isMovingHorizontally && isOnGround) {
                // Start playing footstep sound if it's not already playing
                if (!this.footstepSoundInstance || !this.footstepSoundInstance.isPlaying) {
                    // Ensure previous instance is stopped if it exists but wasn't playing (edge case)
                    if(this.footstepSoundInstance) this.footstepSoundInstance.stop();
                    // Add the sound with loop enabled
                    this.footstepSoundInstance = this.sound.add('footstep', { loop: true, volume: 0.7 }); // Adjust volume
                    this.footstepSoundInstance.play();
                    // console.log("Start footstep sound"); // Debug log
                }
            } else {
                // Stop playing footstep sound if it is playing
                if (this.footstepSoundInstance && this.footstepSoundInstance.isPlaying) {
                    this.footstepSoundInstance.stop();
                    // console.log("Stop footstep sound (dialogue active)"); // Debug log
                }
            }
            // --- End Footstep Sound Logic ---

        } else { // Dialogue IS active
             // Ensure footstep sound is stopped if dialogue starts while walking
             if (this.footstepSoundInstance && this.footstepSoundInstance.isPlaying) {
                 this.footstepSoundInstance.stop();
                 // console.log("Stop footstep sound (dialogue active)"); // Debug log
             }
             // Player movement is already stopped within dialogue logic
        }
        // --- End Player Movement & Sound ---

    } // End of update()

    /**
     * Creates a static ground platform.
     * Sets origin, display size, and depth. Also resizes collider.
     * @param {number} posX - The x-coordinate for the bottom-left corner.
     * @param {number} posY - The y-coordinate for the bottom-left corner.
     * @param {string} imageKey - The texture key for the ground image.
     * @param {number} width - The desired display width for the ground.
     * @param {number} height - The desired display height for the ground.
     * @param {number} depthValue - The desired rendering depth (z-index). // <-- Added parameter
     * @returns {Phaser.Physics.Arcade.Image} The created ground object.
     */
    createGround(posX, posY, imageKey, width, height, depthValue) { // <-- Added depthValue parameter
        const ground = this.platforms.create(posX, posY, imageKey);
        ground.setOrigin(0, 1);
        ground.displayWidth = width;
        ground.displayHeight = height;

        // --- Set the depth ---
        ground.setDepth(depthValue); // <-- Set the depth here
        // ---------------------

        ground.refreshBody(); // Refresh body based on visual size/origin

        // Resize collider (using hardcoded values from your previous code)
        // You might want to pass these as parameters too eventually
        this.resizeStaticCollider(ground, width, 40, 0, 40);

        return ground;
    }


    /**
     * Creates a background image.
     * @param {number} posX - The x-coordinate for the bottom-left corner.
     * @param {number} posY - The y-coordinate for the bottom-left corner.
     * @param {string} imageKey - The texture key for the background image.
     * @param {number} width - The desired display width for the background.
     * @param {number} height - The desired display height for the background.
     */
    createBackground(posX, posY, imageKey, width, height) {
        const bg = this.add.image(posX, posY, imageKey);
        bg.setOrigin(0, 1);
        bg.displayWidth = width;
        bg.displayHeight = height;
        bg.setScrollFactor(0);
        bg.setDepth(-10);
    }

    /**
     * Creates a decorative background ground image (no physics).
     * Sets origin to bottom-left (0, 1).
     * @param {number} posX - The x-coordinate for the bottom-left corner.
     * @param {number} posY - The y-coordinate for the bottom-left corner.
     * @param {string} imageKey - The texture key for the image.
     * @param {number} width - The desired display width.
     * @param {number} height - The desired display height.
     * @param {number} depthValue - The desired rendering depth (z-index).
     * @returns {Phaser.GameObjects.Image} The created image object.
     */
    createBgGround(posX, posY, imageKey, width, height, depthValue) {
        const bgGrnd = this.add.image(posX, posY, imageKey);
        bgGrnd.setOrigin(0, 1);
        bgGrnd.displayWidth = width;
        bgGrnd.displayHeight = height;
        bgGrnd.setDepth(depthValue);
        // bgGrnd.setScrollFactor(0); // Add if this should also be static relative to camera
        return bgGrnd;
    }

    // --- UPDATED FUNCTION to resize and position collider ---
    /**
     * Resizes and positions the Arcade Physics body of a static Game Object.
     * The offset is relative to the Game Object's origin point.
     * @param {Phaser.Physics.Arcade.Image | Phaser.Physics.Arcade.Sprite} gameObject - The game object with the physics body.
     * @param {number} newWidth - The desired width of the physics collider.
     * @param {number} newHeight - The desired height of the physics collider.
     * @param {number} offsetX - The desired horizontal offset of the body's top-left corner relative to the gameObject's origin.
     * @param {number} offsetY - The desired vertical offset of the body's top-left corner relative to the gameObject's origin.
     */
    resizeStaticCollider(gameObject, newWidth, newHeight, offsetX, offsetY) { // Added offsetX, offsetY parameters
        if (!gameObject.body) {
            console.warn("Object does not have a physics body to resize.");
            return;
        }
        // Set the body size
        gameObject.body.setSize(newWidth, newHeight, false); // false = don't center body

        // Set the body offset using the provided parameters
        gameObject.body.setOffset(offsetX, offsetY); // Use parameters directly
    }
    // --- END UPDATED FUNCTION ---

    // --- Overlap Callback Function ---
    /**
     * Called when the player overlaps with the trigger zone.
     * @param {Phaser.Physics.Arcade.Sprite} playerObject - The player sprite.
     * @param {Phaser.GameObjects.Zone} zoneObject - The trigger zone.
     */
    playerEntersZone(playerObject, zoneObject) {
        // Show the bubble only if it's currently hidden
        if (!this.chatBubble.visible) {
            console.log("Player entered zone!"); // For debugging
            this.sound.play('popsound', { volume: 0.9 });
            this.chatBubble.setVisible(true);
        }
        // We'll handle positioning and hiding in update()
    }
    // --- End Callback Function ---

    // --- Typing Effect Function ---
    typeDialogueCharacter() {
        // --- Play Typing Sound ---
        this.sound.play('typeSound', { volume: 0.7 }); // Play the sound (adjust volume if needed)
        // -------------------------

        // Add the next character
        this.typingIndex++;
        this.dialogueTextObject.setText(this.dialogueContent.substring(0, this.typingIndex));

        // Check if finished typing
        if (this.typingIndex >= this.dialogueContent.length) {
            this.isTyping = false;
            if (this.typingTimer) {
                this.typingTimer.remove(); // Stop the timer
                this.typingTimer = null;
            }
        }
    }
    // --- End Typing Effect Function ---

    // --- City Zone Overlap Callback ---
    /**
     * Called when the player overlaps with the city trigger zone.
     * @param {Phaser.Physics.Arcade.Sprite} playerObject - The player sprite.
     * @param {Phaser.GameObjects.Zone} zoneObject - The city trigger zone.
     */
    playerEntersCityZone(playerObject, zoneObject) {
        console.log("Player entered CITY zone!");
    }
    // --- End City Zone Callback ---

    // --- Riefky Zone Overlap Callback ---
    /**
     * Called when the player overlaps with the Riefky trigger zone.
     * @param {Phaser.Physics.Arcade.Sprite} playerObject - The player sprite.
     * @param {Phaser.GameObjects.Zone} zoneObject - The Riefky trigger zone.
     */
    playerEntersRiefkyZone(playerObject, zoneObject) {
        console.log("Player entered RIEFKY zone!");
        // The actual showing of the bubble/prompt is handled in update()
    }
    // --- End Riefky Zone Callback ---
}

const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    width: window.innerWidth,
    height: window.innerHeight,
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: { 
            gravity: { y: 500 },
            debug: false 
        }
    },
    scene: GameScene
};

const game = new Phaser.Game(config);