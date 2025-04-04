define([
    'skbJet/component/gameMsgBus/GameMsgBus',
    'skbJet/component/howlerAudioPlayer/howlerAudioSpritePlayer',
    'skbJet/component/gladPixiRenderer/gladPixiRenderer',
    'skbJet/component/pixiResourceLoader/pixiResourceLoader',
    'skbJet/component/SKBeInstant/SKBeInstant',
    'skbJet/componentCRDC/gladRenderer/gladButton',
    'game/utils/gameUtils',
    'game/configController',
    'skbJet/componentCRDC/Particles/gameParticles',
    'game/component/storePrize'
], function (msgBus, audio, gr, loader, SKBeInstant, gladButton, gameUtils, config,gameParticles,storePrize) {
    var resultData = null;
    var resultPlaque = null;
    var showResultScreen = true;
    var suppressNonWinResultPlaque = false;
    let winParticles_L;
    let winParticles_P;
    let resultWinL1 = 5, resultWinL2=20;
    let winLevel = 0;
    let retryButton = null;
 
    const coinConfig= {
        "alpha": {
            "start": 1,
            "end": 1
        },
        "scale": {
            "start": 0.94,
            "end": 0.78,
            "minimumScaleMultiplier": 0.74
        },
        "color": {
            "start": "#ffffff",
            "end": "#ffffff"
        },
        "speed": {
            "start": 1100,
            "end": 1500,
            "minimumSpeedMultiplier": 0.8
        },
        "acceleration": {
            "x": 0,
            "y": 1500
        },
        "maxSpeed": 0,
        "startRotation": {
            "min": 250,
            "max": 290
        },
        "noRotation": false,
        "rotationSpeed": {
            "min": -90,
            "max": 90
        },
        "lifetime": {
            "min": 6,
            "max": 6
        },
        "blendMode": "normal",
        "frequency": 0.15,
        "emitterLifetime": 2,
        "maxParticles": 1200,
        "pos": {
            "x": 0,
            "y": 0
        },
        "addAtBack": false,
        "spawnType": "rect",
        "spawnRect": {
            "x": 0,
            "y": 405,
            "w": 1028,
            "h": 50
        }
};    

const defaultSpawnRect = {
    landscape: { x: 206, y: 810, w: 1028, h: 50 },
    portrait: { x: 84, y: 1440, w: 642, h: 50 }
};
const spineStyle = {
    landscape: {x:720, y:390,scaleX:1.2, scaleY:1.2, alpha:1},
    portrait: {x:405, y:560,scaleX:1.2, scaleY:1.2, alpha:1}
};

const resultParticleConfig = {
    level0: {
      enabled: false, // should be false. changed for testing purposes.
      landscape: { speed: { start: 1100, end: 1500, minimumSpeedMultiplier: 1 }, frequency: 0.12, scale: { start: 0.74, end: 0.78, minimumScaleMultiplier: 0.74 }, emitterLifetime: 2 },
      portrait: { speed: { start: 1100, end: 1500, minimumSpeedMultiplier: 1 }, frequency: 0.12, scale: { start: 0.74, end: 0.78, minimumScaleMultiplier: 0.74 }, emitterLifetime: 2 }
    },
    level1: {
      enabled: true,
      landscape: { rotationSpeed: { min: -90, max: 90 }, acceleration: { x: 0, y: 1500 }, speed: { start: 1600, end: 2100, minimumSpeedMultiplier: 0.8 }, frequency: 0.0055, scale: { start: 0.94, end: 1.45, minimumScaleMultiplier: 0.94 }, emitterLifetime: 0.35 },
      portrait: { rotationSpeed: { min: -90, max: 90 }, acceleration: { x: 0, y: 1500 }, speed: { start: 2000, end: 2500, minimumSpeedMultiplier: 0.8 }, frequency: 0.0055, scale: { start: 0.94, end: 1.45, minimumScaleMultiplier: 0.94 }, emitterLifetime: 0.35 }
    },
    level2: {
      enabled: true,
      landscape: { rotationSpeed: { min: -90, max: 90 }, acceleration: { x: 0, y: 1500 }, speed: { start: 1600, end: 2100, minimumSpeedMultiplier: 0.8 }, frequency: 0.0028, scale: { start: 0.94, end: 1.45, minimumScaleMultiplier: 0.94 }, emitterLifetime: 0.35 },
      portrait: { rotationSpeed: { min: -90, max: 90 }, acceleration: { x: 0, y: 1500 }, speed: { start: 2000, end: 2500, minimumSpeedMultiplier: 0.8 }, frequency: 0.0028, scale: { start: 0.94, end: 1.45, minimumScaleMultiplier: 0.94 }, emitterLifetime: 0.35 }
    }
  };

  function createEmitterProp(level,orientation) {
    let newConfig = JSON.parse(JSON.stringify(coinConfig));

    // Refer to this orientation
    let customConfig = resultParticleConfig["level"+level][orientation];

    // Set up big win
    // newConfig.bigWinSettings = {};
    // newConfig.bigWinSettings.animatedParticlePrefix = gameConfig.bigWinSettings[orientation].hasOwnProperty('animatedParticlePrefix') ? gameConfig.bigWinSettings[orientation].animatedParticlePrefix : bigWinSettings.animatedParticlePrefix;
    // newConfig.bigWinSettings.isAnimated = gameConfig.bigWinSettings[orientation].hasOwnProperty('isAnimated') ? gameConfig.bigWinSettings[orientation].isAnimated : bigWinSettings.isAnimated;
    // newConfig.bigWinSettings.startFrame = gameConfig.bigWinSettings[orientation].hasOwnProperty('startFrame') ? gameConfig.bigWinSettings[orientation].startFrame : bigWinSettings.startFrame;
    // newConfig.bigWinSettings.endFrame = gameConfig.bigWinSettings[orientation].hasOwnProperty('endFrame') ? gameConfig.bigWinSettings[orientation].endFrame : bigWinSettings.endFrame;
    // newConfig.bigWinSettings.nonAnimatedImages = gameConfig.bigWinSettings[orientation].hasOwnProperty('nonAnimatedImages') ? gameConfig.bigWinSettings[orientation].nonAnimatedImages : bigWinSettings.nonAnimatedImages;
    // newConfig.bigWinSettings.frameRate = gameConfig.bigWinSettings[orientation].hasOwnProperty('frameRate') ? gameConfig.bigWinSettings[orientation].frameRate : bigWinSettings.frameRate;

    // Replace the config values with the configurable parameters
    newConfig.frequency = customConfig.hasOwnProperty('frequency') ? customConfig.frequency : coinConfig.frequency;
    newConfig.maxSpeed = customConfig.hasOwnProperty('maxSpeed') ? customConfig.maxSpeed : coinConfig.maxSpeed;
    newConfig.noRotation = customConfig.hasOwnProperty('noRotation') ? customConfig.noRotation : coinConfig.noRotation;
    newConfig.blendMode = customConfig.hasOwnProperty('blendMode') ? customConfig.blendMode : coinConfig.blendMode;
    newConfig.addAtBack = customConfig.hasOwnProperty('addAtBack') ? customConfig.addAtBack : coinConfig.addAtBack;
    newConfig.spawnType = customConfig.hasOwnProperty('spawnType') ? customConfig.spawnType : coinConfig.spawnType;
    newConfig.emitterLifetime = customConfig.hasOwnProperty('emitterLifetime') ? customConfig.emitterLifetime : coinConfig.emitterLifetime;
    newConfig.maxParticles = customConfig.hasOwnProperty('maxParticles') ? customConfig.maxParticles : coinConfig.maxParticles;

    newConfig.speed.start = (customConfig.hasOwnProperty('speed') && customConfig.speed.hasOwnProperty('start')) ? customConfig.speed.start : coinConfig.speed.start;
    newConfig.speed.end = (customConfig.hasOwnProperty('speed') && customConfig.speed.hasOwnProperty('end')) ? customConfig.speed.end : coinConfig.speed.end;
    newConfig.speed.minimumSpeedMultiplier = (customConfig.hasOwnProperty('speed') && customConfig.speed.hasOwnProperty('minimumSpeedMultiplier')) ? customConfig.speed.minimumSpeedMultiplier : coinConfig.speed.minimumSpeedMultiplier;

    newConfig.scale.start = (customConfig.hasOwnProperty('scale') && customConfig.scale.hasOwnProperty('start')) ? customConfig.scale.start : coinConfig.scale.start;
    newConfig.scale.end = (customConfig.hasOwnProperty('scale') && customConfig.scale.hasOwnProperty('end')) ? customConfig.scale.end : coinConfig.scale.end;
    newConfig.scale.minimumScaleMultiplier = (customConfig.hasOwnProperty('scale') && customConfig.scale.hasOwnProperty('minimumScaleMultiplier')) ? customConfig.scale.minimumScaleMultiplier : coinConfig.speed.minimumScaleMultiplier;

    newConfig.alpha.start = (customConfig.hasOwnProperty('alpha') && customConfig.alpha.hasOwnProperty('start')) ? customConfig.alpha.start : coinConfig.alpha.start;
    newConfig.alpha.end = (customConfig.hasOwnProperty('alpha') && customConfig.alpha.hasOwnProperty('end')) ? customConfig.alpha.end : coinConfig.alpha.end;

    newConfig.color.start = (customConfig.hasOwnProperty('color') && customConfig.color.hasOwnProperty('start')) ? customConfig.color.start : coinConfig.color.start;
    newConfig.color.end = (customConfig.hasOwnProperty('color') && customConfig.color.hasOwnProperty('end')) ? customConfig.color.end : coinConfig.color.end;

    newConfig.startRotation.min = (customConfig.hasOwnProperty('startRotation') && customConfig.startRotation.hasOwnProperty('min')) ? customConfig.startRotation.min : coinConfig.startRotation.min;
    newConfig.startRotation.max = (customConfig.hasOwnProperty('startRotation') && customConfig.startRotation.hasOwnProperty('max')) ? customConfig.startRotation.max : coinConfig.startRotation.max;

    newConfig.rotationSpeed.min = (customConfig.hasOwnProperty('rotationSpeed') && customConfig.rotationSpeed.hasOwnProperty('min')) ? customConfig.rotationSpeed.min : coinConfig.rotationSpeed.min;
    newConfig.rotationSpeed.max = (customConfig.hasOwnProperty('rotationSpeed') && customConfig.rotationSpeed.hasOwnProperty('max')) ? customConfig.rotationSpeed.max : coinConfig.rotationSpeed.max;

    newConfig.lifetime.min = (customConfig.hasOwnProperty('lifetime') && customConfig.lifetime.hasOwnProperty('min')) ? customConfig.lifetime.min : coinConfig.lifetime.min;
    newConfig.lifetime.max = (customConfig.hasOwnProperty('lifetime') && customConfig.lifetime.hasOwnProperty('max')) ? customConfig.lifetime.max : coinConfig.lifetime.max;

    newConfig.acceleration.x = (customConfig.hasOwnProperty('acceleration') && customConfig.acceleration.hasOwnProperty('x')) ? customConfig.acceleration.x : coinConfig.acceleration.x;
    newConfig.acceleration.y = (customConfig.hasOwnProperty('acceleration') && customConfig.acceleration.hasOwnProperty('y')) ? customConfig.acceleration.y : coinConfig.acceleration.y;

    newConfig.pos.x = (customConfig.hasOwnProperty('pos') && customConfig.pos.hasOwnProperty('x')) ? customConfig.pos.x : coinConfig.pos.x;
    newConfig.pos.y = (customConfig.hasOwnProperty('pos') && customConfig.pos.hasOwnProperty('y')) ? customConfig.pos.y : coinConfig.pos.y;

    // We need to also stipulate the orientation specific spawnRect
    newConfig.spawnRect = {};
    newConfig.spawnRect.x = (customConfig.hasOwnProperty('spawnRect') && customConfig.spawnRect.hasOwnProperty('x')) ? customConfig.spawnRect.x : defaultSpawnRect[orientation].x;
    newConfig.spawnRect.y = (customConfig.hasOwnProperty('spawnRect') && customConfig.spawnRect.hasOwnProperty('y')) ? customConfig.spawnRect.y : defaultSpawnRect[orientation].y;
    newConfig.spawnRect.w = (customConfig.hasOwnProperty('spawnRect') && customConfig.spawnRect.hasOwnProperty('w')) ? customConfig.spawnRect.w : defaultSpawnRect[orientation].w;
    newConfig.spawnRect.h = (customConfig.hasOwnProperty('spawnRect') && customConfig.spawnRect.hasOwnProperty('h')) ? customConfig.spawnRect.h : defaultSpawnRect[orientation].h;

    // Init emitters with the new config
    return newConfig;
}        

    function onGameParametersUpdated() {        
        gr.lib._win_Text.autoFontFitText = true;
        gr.lib._win_Try_Text.autoFontFitText = true;
        gr.lib._win_Value.autoFontFitText = true;
        gr.lib._retryText.autoFontFitText = true;

        gr.lib._win_Try_Text.setText(loader.i18n.Game.message_tryWin);
        
        gr.lib._win_Text.setText(loader.i18n.Game.message_buyWin);
        
        if (config.style.closeWinText) {
            gameUtils.setTextStyle(gr.lib._closeWinText, config.style.closeWinText);
        }
		
        if (config.style.simpleWinText) {
            gameUtils.setTextStyle(gr.lib._win_Text, config.style.simpleWinText);
        }
		
        if (config.style.simpleWinTryText) {
            gameUtils.setTextStyle(gr.lib._win_Try_Text, config.style.simpleWinTryText);
        }
		
        if (config.style.simpleWinValue) {
            gameUtils.setTextStyle(gr.lib._win_Value, config.style.simpleWinValue);
        }
        
        if (config.style.nonWin_Text) {
            gameUtils.setTextStyle(gr.lib._nonWin_Text, config.style.nonWin_Text);
        }

        var scaleType = { 'scaleXWhenClick': 0.92, 'scaleYWhenClick': 0.92 };
        retryButton = new gladButton(gr.lib._buttonRetry, config.gladButtonImgName.buttonExit, scaleType);
        gameUtils.setButtonHitArea(gr.lib._buttonRetry, config.gladButtonImgName.buttonExit);
        retryButton.show(false);

        gameUtils.setTextStyle(gr.lib._retryText, config.style.buttonTextStyle);
        gr.lib._retryText.setText(loader.i18n.Game.button_retry);
        
		isShowResultDialog();
        gr.lib._nonWin_Text.setText(loader.i18n.Game.message_nonWin);
        
        hideDialog();
        if (SKBeInstant.config.customBehavior) {            
            if (SKBeInstant.config.customBehavior.hasOwnProperty('resultWinL1')) {
                resultWinL1 = Number(SKBeInstant.config.customBehavior.resultWinL1);
            }
            if (SKBeInstant.config.customBehavior.hasOwnProperty('resultWinL2')) {
                resultWinL2 = Number(SKBeInstant.config.customBehavior.resultWinL2);
            }
        } else if (loader.i18n.gameConfig) {
            if (loader.i18n.gameConfig.hasOwnProperty('resultWinL1')) {
                resultWinL1 = Number(loader.i18n.gameConfig.resultWinL1);
            }
            if (loader.i18n.gameConfig.hasOwnProperty('resultWinL2')) {
                resultWinL2 = Number(loader.i18n.gameConfig.resultWinL2);
            }
        }
        gr.lib._winDim.pixiContainer.interactive = true;
        gr.lib._nonWinDim.pixiContainer.interactive = true;
        gr.lib._winDim.pixiContainer.cursor = "pointer";
        gr.lib._nonWinDim.pixiContainer.cursor = "pointer";

        function onclickGame() {
            if(resultData.playResult==='WIN'){                
                if(resultData.prizeValue >= resultWinL1* resultData.price){
                    winParticles_L.destroy();
                    winParticles_P.destroy();
                }
            }
            closeResultPlaque();
        }

        gr.lib._winDim.on("click", onclickGame);
        gr.lib._nonWinDim.on("click", onclickGame);
        retryButton.click(reSendRequest);
    }

    function reSendRequest(){
        retryButton.show(false);
        msgBus.publish('jLotteryGame.ticketResultHasBeenSeen', {
            tierPrizeShown: resultData.prizeDivision,
            formattedAmountWonShown: resultData.prizeValue
        });
    }

	function closeResultPlaque(){
        hideDialog();
        gameUtils.playSoundByConfig("ButtonGeneric");
		// if (config.audio && config.audio.ButtonGeneric) {
		// 	audio.play(config.audio.ButtonGeneric.name, config.audio.ButtonGeneric.channel);
		// }
		// Publish a message when result dialog is closed by user.
		// 21.june 5:50
		// msgBus.publish('resultDialogClosed');
	}
	
    function hideDialog() {
        gr.lib._winPlaque.show(false);
        gr.lib._nonWinPlaque.show(false);
    }

    function showSimpleWin(){
        if(SKBeInstant.config.wagerType==='BUY'){
            gr.lib._win_Text.show(true);
            gr.lib._win_Try_Text.show(false);
        }else{
            gr.lib._win_Try_Text.show(true);
            gr.lib._win_Text.show(false);
        }
        gr.lib._win_Value.setText(SKBeInstant.formatCurrency(resultData.prizeValue).formattedAmount);
        gr.lib._winPlaque.show(true);
    }
	
    function showNoWinResultScreen(){
        gr.lib._winPlaque.show(false);
        gr.lib._nonWinPlaque.show(true);
    }
    
    function isShowResultDialog() {
        if (SKBeInstant.config.customBehavior) {
            if (SKBeInstant.config.customBehavior.showResultScreen === false) {
                showResultScreen = false;
            }
            if (SKBeInstant.config.customBehavior.suppressNonWinResultPlaque === true) {
                suppressNonWinResultPlaque = true;
            }
        } else if (loader.i18n.gameConfig) {
            if (loader.i18n.gameConfig.showResultScreen === false) {
                showResultScreen = false;
            }
            if (loader.i18n.gameConfig.suppressNonWinResultPlaque === true) {
                suppressNonWinResultPlaque = true;
            }
        }
    }

    function onStartUserInteraction(data) {
        resultData = data;
      //  gr.lib._BG_dim.show(false);        
        hideDialog();
    }

    function onAllRevealed() {
        if(resultData.prizeValue !== storePrize.getTotalWin()){
            msgBus.publish('winboxError', {errorCode :'29000'});
        }else{
            msgBus.publish('jLotteryGame.ticketResultHasBeenSeen', {
                tierPrizeShown: resultData.prizeDivision,
                formattedAmountWonShown: resultData.prizeValue
            });
        }
 
        msgBus.publish('disableUI');
    }

    function onEnterResultScreenState() {
        if (resultData.playResult==='WIN') {
            gameUtils.resetSpine(gr.lib._winParticles.spine);
            gr.lib._winParticles.spine.state.setAnimation(0,"totalWin",true);
            if(resultData.prizeValue >= resultWinL1* resultData.price){
                winLevel = resultData.prizeValue > resultWinL2 * resultData.price ?2:1;
                winParticles_L = new gameParticles(gr.lib._winParticles_L, "winCoin", createEmitterProp(winLevel,"landscape") ,{type:"anim",framerate:0.4});
                winParticles_P = new gameParticles(gr.lib._winParticles_P, "winCoin", createEmitterProp(winLevel,"portrait") ,{type:"anim",framerate:0.4});
                winParticles_L.startAnim();
                winParticles_P.startAnim();
            }
            gameUtils.playSoundByConfig("Win");
            audio.volume(0,0.5);
            if (showResultScreen) {
                showSimpleWin();
            }
        } else {
            gameUtils.playSoundByConfig("Lose");
            audio.volume(0,0.5);
            if (showResultScreen && !suppressNonWinResultPlaque) {
                showNoWinResultScreen();
            } 
        }
    }

    function onReStartUserInteraction(data) {
        onStartUserInteraction(data);
    }

    function onReInitialize() {
        hideDialog();
    }

    function onTutorialIsShown(){
        if(gr.lib._winPlaque.pixiContainer.visible || gr.lib._nonWinPlaque.pixiContainer.visible){            
            resultPlaque = gr.lib._winPlaque.pixiContainer.visible? gr.lib._winPlaque: gr.lib._nonWinPlaque;
            hideDialog();
        } 
        gr.lib._BG_dim.show(true);
    }
    
    function onTutorialIsHide(){
        if(resultPlaque){
            resultPlaque.show(true);
            // if (resultData.playResult === 'WIN'){
            // }
            resultPlaque = null;
        }        
    }

    function onOrientChange(isPortrait){
        if(gr.lib._winParticles.spine){
            gameUtils.setSpineStype(gr.lib._winParticles.spine, spineStyle[isPortrait?"portrait":"landscape"]);
        }
    }

    function onRetry(){
        retryButton.show(true);
    }

    msgBus.subscribe('jLottery.reInitialize', onReInitialize);
    msgBus.subscribe('jLottery.reStartUserInteraction', onReStartUserInteraction);

    msgBus.subscribe('jLottery.startUserInteraction', onStartUserInteraction);
    msgBus.subscribe('jLottery.enterResultScreenState', onEnterResultScreenState);
    msgBus.subscribe('SKBeInstant.gameParametersUpdated', onGameParametersUpdated);
    msgBus.subscribe('allRevealed', onAllRevealed);
    // msgBus.subscribe('jLottery.beginNewGame', onBeginNewGame);
    msgBus.subscribe('tutorialIsShown', onTutorialIsShown);
    msgBus.subscribe('tutorialIsHide', onTutorialIsHide);
    msgBus.subscribe('changeBackgroundBGIfPortrait', onOrientChange);
    msgBus.subscribe('ticketCostChanged', hideDialog);
    msgBus.subscribe('jLotterySKB.retry', onRetry);

    return {};
});