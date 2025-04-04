/**
 * @module game/buyAndTryController
 * @description buy and try button control
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
    
    var currentTicketCost = null;
    var replay, tryButton, buyButton;
    var MTMReinitial = false;
    
    function onGameParametersUpdated(){
        var scaleType = {'scaleXWhenClick': 0.92, 'scaleYWhenClick': 0.92, 'avoidMultiTouch':true};
        tryButton = new gladButton(gr.lib._buttonTry, config.gladButtonImgName.buttonTry, scaleType);
        gameUtils.setButtonHitArea(gr.lib._buttonTry, config.gladButtonImgName.buttonTry);

        buyButton = new gladButton(gr.lib._buttonBuy, config.gladButtonImgName.buttonBuy, scaleType);
        gameUtils.setButtonHitArea(gr.lib._buttonBuy, config.gladButtonImgName.buttonBuy);
        
        gr.lib._buttonBuy.show(false);
        gr.lib._buttonTry.show(false);
        gr.lib._network.show(false);
        replay = false;
        
        gameUtils.setTextStyle(gr.lib._buyText, config.style.buttonTextStyle);

        if (config.textAutoFit.buyText){
            gr.lib._buyText.autoFontFitText = config.textAutoFit.buyText.isAutoFit;
        }

        if(SKBeInstant.config.wagerType === 'BUY'){
            gr.lib._buyText.setText(loader.i18n.Game.button_buy);
        }else{
            gr.lib._buyText.setText(loader.i18n.Game.button_try);
        }

        if (config.style.tryText) {
            gameUtils.setTextStyle(gr.lib._tryText, config.style.tryText);
        }
        if (config.textAutoFit.tryText){
            gr.lib._tryText.autoFontFitText = config.textAutoFit.tryText.isAutoFit;
        }

        gr.lib._tryText.setText(loader.i18n.Game.button_try);
        
        gameUtils.setTextStyle(gr.lib._tryText, config.style.buttonTextStyle);
        gameUtils.setTextStyle(gr.lib._buyText, config.style.buttonTextStyle);
		
		if(gr.lib._MTMText){
			gameUtils.keepSameSizeWithMTMText(gr.lib._tryText, gr);
		}
		
        tryButton.click(buyOrTryClickEvent);
        buyButton.click(buyOrTryClickEvent);
    }
	
    function play() {
        if (replay) {
            msgBus.publish('jLotteryGame.playerWantsToRePlay', {price:currentTicketCost});
        } else {
            msgBus.publish('jLotteryGame.playerWantsToPlay', {price:currentTicketCost});
        }
        gr.lib._buttonBuy.show(false);
        gr.lib._buttonTry.show(false);
        gr.lib._network.show(true);
        gr.lib._network.gotoAndPlay('network', 0.3, true);
		/* 
		* Update ButtonGeneric to ButtonBuy, because Buy button audio is different from ButtonGeneric
		* 13/june 2019
        */
       gameUtils.playSoundByConfig("ButtonBuy");
        // if (config.audio && config.audio.ButtonBuy) {
        //     audio.play(config.audio.ButtonBuy.name, config.audio.ButtonBuy.channel);
        // }
        // msgBus.publish('disableUI');
    }

	function buyOrTryClickEvent(){
        msgBus.publish('buyOrTryHaveClicked');        
		play();
	}
	
    function onStartUserInteraction(data) {
        gr.lib._network.stopPlay();
        gr.lib._network.show(false);        
        
        gr.lib._buttonBuy.show(false);
        gr.lib._buttonTry.show(false);
        currentTicketCost = data.price;
        replay = true;
    }

    

    function showBuyOrTryButton() {
        if (SKBeInstant.config.jLotteryPhase !== 2) {
            return;
        }
            gr.lib._buttonBuy.show(true);
            gr.lib._buttonTry.show(true);
    }

    function onInitialize() {
        showBuyOrTryButton();
    }

    function onTicketCostChanged(data) {
        currentTicketCost = data;
    }

    function onReInitialize() {
        gr.lib._network.stopPlay();
        gr.lib._network.show(false);  
        
        if (MTMReinitial) {
			replay = false;
            gr.lib._buyText.setText(loader.i18n.Game.button_buy);
            MTMReinitial = false;
        }
        showBuyOrTryButton();
    }
    
    function onBeginNewGame(){
        showBuyOrTryButton();
    }
    
    function onReStartUserInteraction(){
        gr.lib._network.stopPlay();
        gr.lib._network.show(false);   
    }
    
    function onPlayerWantsToMoveToMoneyGame(){
        MTMReinitial = true;
    }
    function onReset(){
        gr.lib._network.stopPlay();
        gr.lib._network.show(false);  
        showBuyOrTryButton();
    }

    function onTutorialIsShown(){
        // gr.lib._buttonBuy.pixiContainer.interactive = false;
        // gr.lib._buttonTry.pixiContainer.interactive = false;
        tryButton.enable(false);
        buyButton.enable(false);
    }
    
    function onTutorialIsHide(){
        tryButton.enable(true);
        buyButton.enable(true);
        // gr.lib._buttonBuy.pixiContainer.interactive = true;
        // gr.lib._buttonTry.pixiContainer.interactive = true;
    }
    msgBus.subscribe('jLotterySKB.reset', onReset);
    msgBus.subscribe("jLottery.beginNewGame", onBeginNewGame);
    msgBus.subscribe('jLottery.reInitialize', onReInitialize);
    msgBus.subscribe('jLottery.initialize', onInitialize);
    msgBus.subscribe('jLottery.startUserInteraction', onStartUserInteraction);
    msgBus.subscribe('ticketCostChanged', onTicketCostChanged);
    msgBus.subscribe('SKBeInstant.gameParametersUpdated', onGameParametersUpdated);
    msgBus.subscribe('jLottery.reStartUserInteraction', onReStartUserInteraction);
    msgBus.subscribe('jLotteryGame.playerWantsToMoveToMoneyGame',onPlayerWantsToMoveToMoneyGame);
    msgBus.subscribe('tutorialIsShown', onTutorialIsShown);
    msgBus.subscribe('tutorialIsHide', onTutorialIsHide);

    return {};
});