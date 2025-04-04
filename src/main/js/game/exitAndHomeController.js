/**
 * @module game/exitButton
 * @description exit button control
 */
define([
  'skbJet/component/gameMsgBus/GameMsgBus',
  'skbJet/component/howlerAudioPlayer/howlerAudioSpritePlayer',
  'skbJet/component/gladPixiRenderer/gladPixiRenderer',
  'skbJet/component/pixiResourceLoader/pixiResourceLoader',
  'skbJet/component/SKBeInstant/SKBeInstant',
  'skbJet/componentCRDC/gladRenderer/gladButton',
  'game/utils/gameUtils',
  'game/configController'
], function (msgBus, audio, gr, loader, SKBeInstant, gladButton, gameUtils, config) {
  var exitButton, homeButton;
  var whilePlaying = false;
  var isWLA = false;
  var isSKB = false;

  function exit() {
    gameUtils.playSoundByConfig("ButtonGeneric");
    // if (config.audio && config.audio.ButtonGeneric) {
    //   audio.play(config.audio.ButtonGeneric.name, config.audio.ButtonGeneric.channel);
    // }
    msgBus.publish('jLotteryGame.playerWantsToExit');
  }

  function onGameParametersUpdated() {
    var scaleType = { 'scaleXWhenClick': 0.92, 'scaleYWhenClick': 0.92 };
    exitButton = new gladButton(gr.lib._buttonExit, config.gladButtonImgName.buttonExit, scaleType);
    gameUtils.setButtonHitArea(gr.lib._buttonExit, config.gladButtonImgName.buttonExit);

    isWLA = SKBeInstant.isWLA() ? true : false;
    isSKB = SKBeInstant.isSKB() ? true : false;

    gameUtils.setTextStyle(gr.lib._exitText, config.style.buttonTextStyle);

    if (config.textAutoFit.exitText) {
      gr.lib._exitText.autoFontFitText = config.textAutoFit.exitText.isAutoFit;
    }
    gr.lib._exitText.setText(loader.i18n.Game.button_exit);

    exitButton.click(exit);
    gr.lib._buttonExit.show(false);
    if (!isSKB) {
      homeButton = new gladButton(gr.lib._buttonHome, config.gladButtonImgName.buttonHome, { 'scaleXWhenClick': 0.92, 'scaleYWhenClick': 0.92, 'avoidMultiTouch': true });
      gameUtils.setButtonHitArea(gr.lib._buttonHome, config.gladButtonImgName.buttonHome);

      homeButton.click(exit);
      homeButton.show(false);
    } else {
      gr.lib._buttonHome.show(false);
    }
  }

  function onInitialize() {
    if (isSKB) { return; }
    if (isWLA) {
      if (Number(SKBeInstant.config.jLotteryPhase) === 1) {
        homeButton.show(false);
      } else {
        if (SKBeInstant.config.customBehavior) {
          if (SKBeInstant.config.customBehavior.showTutorialAtBeginning === false) {
            homeButton.show(true);
          }
        } else if (loader.i18n.gameConfig) {
          if (loader.i18n.gameConfig.showTutorialAtBeginning === false) {
            homeButton.show(true);
          }
        }
      }
    }
  }

  function onBeginNewGame() {
    if (Number(SKBeInstant.config.jLotteryPhase) === 1) {
      gr.lib._buttonExit.show(true);
    } else {
      whilePlaying = false;
      if (isSKB) { return; }
      if (isWLA) {
        if (gr.lib._warningAndError && !gr.lib._warningAndError.pixiContainer.visible) {
          homeButton.show(true);
          homeButton.enable(true);
        }
      }
    }
  }

  function onReInitialize() {
    whilePlaying = false;    
    if (isSKB) { return; }
    if (isWLA && !gr.lib._tutorial.pixiContainer.visible) {
      homeButton.enable(true);
      homeButton.show(true);
    }
  }

  function onDisableUI() {
    if (isSKB) { return; }
    if (isWLA) {
      // homeButton.show(false);
      homeButton.enable(false);
    }
  }

  function onEnableUI() {
    if (isSKB) { return; }
    if (Number(SKBeInstant.config.jLotteryPhase) === 2 && !whilePlaying && isWLA) {
      // homeButton.show(true);
      homeButton.enable(true);
    }
  }

  function onTutorialIsShown() {
    exitButton.enable(false);
    if (isSKB) { return; }
    if (isWLA) {
      homeButton.show(false);
    }
  }

  function onTutorialIsHide() {
    exitButton.enable(true);
    if (isSKB) { return; }
    if (Number(SKBeInstant.config.jLotteryPhase) === 2 && !whilePlaying && isWLA) {
      homeButton.show(true);
    }
  }

  function onReStartUserInteraction() {
    whilePlaying = true;
    if (isSKB) { return; }
    if (isWLA) {
      homeButton.show(false);
    }
  }
  function onStartUserInteraction() {
    whilePlaying = true;
    if (isSKB) { return; }
    if (isWLA) {
      homeButton.show(false);
    }
  }
  msgBus.subscribe('disableUI', onDisableUI);
  msgBus.subscribe('enableUI', onEnableUI);
  msgBus.subscribe('jLottery.beginNewGame', onBeginNewGame);
  msgBus.subscribe('SKBeInstant.gameParametersUpdated', onGameParametersUpdated);
  msgBus.subscribe('jLottery.initialize', onInitialize);
  msgBus.subscribe('jLottery.reInitialize', onReInitialize);
  msgBus.subscribe('jLotterySKB.reset', onEnableUI);
  msgBus.subscribe('tutorialIsShown', onTutorialIsShown);
  msgBus.subscribe('tutorialIsHide', onTutorialIsHide);
  msgBus.subscribe('jLottery.reStartUserInteraction', onReStartUserInteraction);
  msgBus.subscribe('jLottery.startUserInteraction', onStartUserInteraction);
  msgBus.subscribe('buyOrTryHaveClicked',onDisableUI);
  msgBus.subscribe('jLotteryGame.playerWantsToMoveToMoneyGame',function(){
    if(homeButton){
      homeButton.enable(false);
    }
  });

  return {};
});

