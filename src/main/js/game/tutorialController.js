/**
 * @module game/tutorialController
 * @description result dialog control
 */
define([
    'skbJet/component/gameMsgBus/GameMsgBus',
    'skbJet/component/howlerAudioPlayer/howlerAudioSpritePlayer',
    'skbJet/component/gladPixiRenderer/gladPixiRenderer',
    'skbJet/component/pixiResourceLoader/pixiResourceLoader',
    'skbJet/componentCRDC/gladRenderer/gladButton',
    'skbJet/component/SKBeInstant/SKBeInstant',
    'game/utils/gameUtils',
    'game/configController'
], function (msgBus, audio, gr, loader, gladButton, SKBeInstant, gameUtils, config) {
    var buttonInfo, buttonClose;
    var left, right;
    var index = 0, minIndex = 0, maxIndex;
    var shouldShowTutorialWhenReinitial = false;
    var iconOnImage, iconOffImage, buttonCloseImage, buttonInfoImage;
	var showTutorialAtBeginning = false;
    var resultIsShown = false;
    //var showButtonInfoTimer = null;
    // var upChannel = 0;
    // var downChannel = 0;
    function showTutorial() {
        gr.lib._BG_dim.off('click');
        buttonInfo.show(false);
        gr.lib._BG_dim.show(true);
        gr.lib._tutorial.show(true);
        if (gr.lib._winPlaque.pixiContainer.visible || gr.lib._nonWinPlaque.pixiContainer.visible) {
            resultIsShown = true;
        }
        gr.animMap._tutorialAnim.play();
        msgBus.publish('tutorialIsShown');
        gameUtils.playSoundByConfig("ButtonGeneric");
        // if(config.audio.HelpPageOpen){
        //     audio.play(config.audio.HelpPageOpen.name, config.audio.HelpPageOpen.channel);
        // }
    }

    function hideTutorial() {
        index = minIndex;
        gr.animMap._tutorialUP._onComplete = function(){
            gr.lib._tutorial.show(false);
            for (var i = minIndex; i <= maxIndex; i++) {
                if (i === minIndex) {
                    gr.lib['_tutorialPage_0' + i].show(true);
                    gr.lib['_tutorialPage_0'+i+'_Text_00'].show(true);
                    if (gr.lib['_tutorialPageIcon_0' + i]) {
                        gr.lib['_tutorialPageIcon_0' + i].setImage(iconOnImage);
                    }
                } else {
                    gr.lib['_tutorialPage_0' + i].show(false);
                    gr.lib['_tutorialPage_0'+i+'_Text_00'].show(false);
                    gr.lib['_tutorialPageIcon_0' + i].setImage(iconOffImage);
                }
            }
        buttonInfo.show(true);
        if (!resultIsShown){
            gr.lib._BG_dim.show(false);
        }else{
            resultIsShown = false;
        }
        msgBus.publish('tutorialIsHide');
    };
        gr.animMap._tutorialUP.play();     
        // if(config.audio.HelpPageClose){
        //     audio.play(config.audio.HelpPageClose.name, config.audio.HelpPageClose.channel);
        // }   
    }

    function onGameParametersUpdated() {
		if (config.textAutoFit.versionText){
            gr.lib._versionText.autoFontFitText = config.textAutoFit.versionText.isAutoFit;
        }
		gr.lib._versionText.setText(window._cacheFlag.gameVersion+".CL"+window._cacheFlag.changeList+"_"+window._cacheFlag.buildNumber);
		/**
		*	Update at 1 July
		* 	Version test should show in WLA env, not in COM env
		*/
		if (SKBeInstant.isWLA()) {
            gr.lib._versionText.show(true);
        } else {
            gr.lib._versionText.show(false);
        }
        // Prevent click the symbols when tutorial is shown
        gr.lib._BG_dim.on('click', function(event){
            event.stopPropagation();
        });

        iconOnImage = config.gladButtonImgName.iconOn;
        iconOffImage = config.gladButtonImgName.iconOff;
        buttonCloseImage = config.gladButtonImgName.tutorialButtonClose || "buttonClose";
        buttonInfoImage = config.gladButtonImgName.buttonInfo || "buttonInfo";
        maxIndex = Number(config.gameParam.pageNum)-1;
        
        var scaleType = {'scaleXWhenClick': 0.92, 'scaleYWhenClick': 0.92, 'avoidMultiTouch':true};
        buttonInfo = new gladButton(gr.lib._buttonInfo, buttonInfoImage, scaleType);
        gameUtils.setButtonHitArea(gr.lib._buttonInfo, buttonInfoImage);
        
        buttonClose = new gladButton(gr.lib._buttonCloseTutorial, buttonCloseImage, scaleType);
        gameUtils.setButtonHitArea(gr.lib._buttonCloseTutorial, buttonCloseImage);
        
        buttonInfo.show(false);
        if (SKBeInstant.config.customBehavior) {
            if (SKBeInstant.config.customBehavior.showTutorialAtBeginning === true) {
                showTutorialAtBeginning = true;
                buttonInfo.show(false);                
            }
        } else if (loader.i18n.gameConfig) {
            if (loader.i18n.gameConfig.showTutorialAtBeginning === true) {
                showTutorialAtBeginning = true;
                buttonInfo.show(false);
            }
        }
        if(showTutorialAtBeginning){
            msgBus.publish('showTutorialAtBeginning');
        }else{
            gr.lib._BG_dim.show(false);
            gr.lib._tutorial.show(false);
        }
		
        buttonInfo.click(function () {
            showTutorial();
            gameUtils.playSoundByConfig("ButtonGeneric");
            // audio.play(config.audio.ButtonGeneric.name, config.audio.ButtonGeneric.channel);
        });

        buttonClose.click(function () {
            hideTutorial();
            gameUtils.playSoundByConfig("ButtonGeneric");
            // audio.play(config.audio.ButtonGeneric.name, config.audio.ButtonGeneric.channel);
        });
        if (gr.lib._buttonTutorialArrowLeft) {
            left = new gladButton(gr.lib._buttonTutorialArrowLeft, config.gladButtonImgName.tutorialLeft, scaleType);
            gameUtils.setButtonHitArea(gr.lib._buttonTutorialArrowLeft, config.gladButtonImgName.tutorialLeft);
            left.click(function () {
                index--;
                if (index < minIndex){
                    index = maxIndex;
                }
                showTutorialPageByIndex(index);
                gameUtils.playSoundByConfig("ButtonGeneric");
                // if (config.audio && config.audio.ButtonBetDown) {
                //     audio.play(config.audio.ButtonBetDown.name, downChannel);
                //     downChannel = (downChannel + 1) % 2;
                // }
            });
        }
        if (gr.lib._buttonTutorialArrowRight) {
            right = new gladButton(gr.lib._buttonTutorialArrowRight, config.gladButtonImgName.tutorialRight, {'scaleXWhenClick': 0.92, 'scaleYWhenClick': 0.92, 'avoidMultiTouch': true});
            gameUtils.setButtonHitArea(gr.lib._buttonTutorialArrowRight, config.gladButtonImgName.tutorialRight);
            right.click(function () {
                index++;
                if (index > maxIndex){
                    index = minIndex;
                }

                showTutorialPageByIndex(index);
                gameUtils.playSoundByConfig("ButtonGeneric");
                // if (config.audio && config.audio.ButtonBetUp) {
                //     audio.play(config.audio.ButtonBetUp.name, upChannel);
                //     upChannel = (upChannel + 1) % 2;
                // }
            });
        }

        for (var i = minIndex; i <= maxIndex; i++) {
            gameUtils.setTextStyle(gr.lib['_tutorialPage_0'+i+'_title'],config.style.tutorialTitleText);
            gr.lib['_tutorialPage_0'+i+'_title'].autoFontFitText = true;
            gr.lib['_tutorialPage_0'+i+'_title'].setText(loader.i18n.Game['tutorial_title_'+i]);
            if(i !== 0){
                gr.lib['_tutorialPage_0' + i].show(false);
                gr.lib['_tutorialPage_0'+i+'_Text_00'].show(false);
            }else{
                if (gr.lib['_tutorialPageIcon_0' + i]) {
                    gr.lib['_tutorialPageIcon_0' + i].setImage(iconOnImage);
                }
            }
            if(i == 4 && loader.i18n.Game.lucky){
                //FIVECARD-178: adding text LUCKY
                const leftTxt = gr.lib["_luckyTextLeft"];
                const rightTxt = gr.lib["_luckyTextRight"];
                const text = loader.i18n.Game.lucky;
                // const text = "HHHHHH";
                leftTxt.autoFontFitText = true;
                rightTxt.autoFontFitText = true;
                leftTxt.setText(text);
                rightTxt.setText(text);
                
            }
            var obj = gr.lib['_tutorialPage_0'+i+'_Text_00'];
            obj.originialLineHeight = Math.floor(obj.pixiContainer.$text.style.lineHeight);
            gameUtils.setTextStyle(obj,config.style.whiteTextStyle);
            if (loader.i18n.Game['tutorial_0' + i + '_landscape'] || loader.i18n.Game['tutorial_0' + i + '_portrait']){
                if(SKBeInstant.getGameOrientation() === "landscape"){
                    obj.setText(loader.i18n.Game['tutorial_0' + i + '_landscape']);
                    obj.pixiContainer.$text.style.lineHeight = obj.originialLineHeight - 5;
                }else{
                    obj.setText(loader.i18n.Game['tutorial_0' + i + '_portrait']);
                    obj.pixiContainer.$text.style.lineHeight = obj.originialLineHeight;
                }
            }else{
                obj.setText(loader.i18n.Game['tutorial_0' + i]);
            }
        }

        // gameUtils.setTextStyle(gr.lib._tutorialTitleText,config.style.tutorialTitleText);
        // if (config.textAutoFit.tutorialTitleText){
        //     gr.lib._tutorialTitleText.autoFontFitText = config.textAutoFit.tutorialTitleText.isAutoFit;
        // }
        // gr.lib._tutorialTitleText.setText(loader.i18n.Game.tutorial_title);
        gameUtils.setTextStyle(gr.lib._closeTutorialText,config.style.buttonTextStyle);
        if (config.textAutoFit.closeTutorialText){
            gr.lib._closeTutorialText.autoFontFitText = config.textAutoFit.closeTutorialText.isAutoFit;
        }
        gr.lib._closeTutorialText.setText(loader.i18n.Game.message_close);
        if (config.dropShadow) {
            gameUtils.setTextStyle(gr.lib._closeTutorialText, {
                padding: config.dropShadow.padding,
                dropShadow: config.dropShadow.dropShadow,
                dropShadowDistance: config.dropShadow.dropShadowDistance
            });
            gameUtils.setTextStyle(gr.lib._tutorialTitleText, {
                padding: config.dropShadow.padding,
                dropShadow: config.dropShadow.dropShadow,
                dropShadowDistance: config.dropShadow.dropShadowDistance
            });
        }
        onOrientChange(SKBeInstant.getGameOrientation() === 'portrait');
    }

    function showTutorialPageByIndex(index){
        hideAllTutorialPages();
        gr.lib['_tutorialPage_0' + index].show(true);
        gr.lib['_tutorialPage_0'+ index +'_Text_00'].show(true);
        gr.lib['_tutorialPageIcon_0'+index].setImage(iconOnImage);
    }

    function hideAllTutorialPages(){
        for (var i = 0; i <= maxIndex; i++){
            gr.lib['_tutorialPage_0' + i].show(false);
            gr.lib['_tutorialPage_0'+ i +'_Text_00'].show(false);
            if (gr.lib['_tutorialPageIcon_0' + i]) {
                gr.lib['_tutorialPageIcon_0' + i].setImage(iconOffImage);
            }
        }
    }

    function onReInitialize() {
        msgBus.publish("enableButtonInfo");
        if(shouldShowTutorialWhenReinitial){
            shouldShowTutorialWhenReinitial = false;
            if (showTutorialAtBeginning) {
                showTutorial();
            }else{
                msgBus.publish('tutorialIsHide');
            }           
        }else{
            gr.lib._tutorial.show(false);
            buttonInfo.show(true);
        }
    }

    // function onDisableUI() {
    //     gr.lib._buttonInfo.show(false);
    // }
    
    function onEnableUI() {
        buttonInfo.enable(true);
        gr.lib._buttonInfo.show(true);
    }
    
    function showTutorialOnInitial(){
        for (var i = minIndex; i <= maxIndex; i++) {
            if (i === minIndex) {
                gr.lib['_tutorialPage_0' + i].show(true);
                gr.lib['_tutorialPage_0' + i + '_Text_00'].show(true);
                if (gr.lib['_tutorialPageIcon_0' + i]) {
                    gr.lib['_tutorialPageIcon_0' + i].setImage(iconOnImage);
                }
            } else {
                gr.lib['_tutorialPage_0' + i].show(false);
                gr.lib['_tutorialPage_0' + i + '_Text_00'].show(false);
                gr.lib['_tutorialPageIcon_0' + i].setImage(iconOffImage);
            }
        }
        if(buttonInfo){
            buttonInfo.show(false);
        }
        gr.lib._BG_dim.show(true);
        gr.lib._tutorial.show(true);
        msgBus.publish('tutorialIsShown');
    }
    
    function onInitialize(){
        if(showTutorialAtBeginning){
            showTutorialOnInitial();
        }else{
            msgBus.publish('tutorialIsHide');
        }
    }
    function onReStartUserInteraction(){	
        if(gr.lib._prizeTable.pixiContainer.visible === false ){
            enableButtonInfo();
        }
        buttonInfo.show(true);
    }
    function onStartUserInteraction(){
        if(gr.lib._prizeTable.pixiContainer.visible === false ){
            enableButtonInfo();
        }
        if(SKBeInstant.config.gameType === 'ticketReady'){
            if (showTutorialAtBeginning) {
                showTutorialOnInitial();
            } else {
                msgBus.publish('tutorialIsHide');
            }
        }else{
            gr.lib._tutorial.show(false);
            buttonInfo.show(true);
        }
    }
    
    function onBeginNewGame() {
        if (gr.lib._warningAndError && !gr.lib._warningAndError.pixiContainer.visible) {
            // buttonInfo.show(true);
            buttonInfo.enable(true);
        }
    }
    
    function onPlayerWantsToMoveToMoneyGame(){
        shouldShowTutorialWhenReinitial = true;
        msgBus.publish("disableButtonInfo");
    }

    function onTutorialIsHide(){
        buttonInfo.show(true);
    }
	
	/**
	*	2 July 2019
	* 	Subscribe two function which are enable and disable button info for game in GIP.
	*/
	function disableButtonInfo(){
		buttonInfo.enable(false);
	}
	
	function enableButtonInfo(){
		buttonInfo.enable(true);
	}

    function onOrientChange(isPortrait){
        for (var i = minIndex; i <= maxIndex; i++) {
            var obj = gr.lib['_tutorialPage_0'+i+'_Text_00'];
            if (loader.i18n.Game['tutorial_0' + i + '_landscape'] || loader.i18n.Game['tutorial_0' + i + '_portrait']){
                if(isPortrait){
                    obj.setText(loader.i18n.Game['tutorial_0' + i + '_portrait']);
                    obj.pixiContainer.$text.style.lineHeight = obj.originialLineHeight;
                }else{
                    obj.setText(loader.i18n.Game['tutorial_0' + i + '_landscape']);
                    obj.pixiContainer.$text.style.lineHeight = obj.originialLineHeight - 5;
                }
            }else{
                obj.setText(loader.i18n.Game['tutorial_0' + i]);
            }
            gameUtils.setTextStyle(obj,config.style.whiteTextStyle);
        }
    }
	
    msgBus.subscribe('jLotterySKB.reset', function(){onEnableUI();});
    msgBus.subscribe('enableUI', enableButtonInfo);
    msgBus.subscribe('disableUI', disableButtonInfo);
    msgBus.subscribe('jLottery.initialize', onInitialize);
    msgBus.subscribe('jLottery.reInitialize', onReInitialize);
    msgBus.subscribe('SKBeInstant.gameParametersUpdated', onGameParametersUpdated);
    msgBus.subscribe('jLottery.reStartUserInteraction', onReStartUserInteraction);
    msgBus.subscribe('jLotteryGame.playerWantsToMoveToMoneyGame',onPlayerWantsToMoveToMoneyGame);
    msgBus.subscribe('jLottery.startUserInteraction', onStartUserInteraction);
    msgBus.subscribe('jLottery.beginNewGame', onBeginNewGame);
    msgBus.subscribe('tutorialIsHide', onTutorialIsHide);
    msgBus.subscribe('enableButtonInfo', enableButtonInfo);
    msgBus.subscribe('disableButtonInfo', disableButtonInfo);
    msgBus.subscribe('changeBackgroundBGIfPortrait', onOrientChange);
    msgBus.subscribe('buyOrTryHaveClicked',disableButtonInfo);
    msgBus.subscribe("startPicker", function(){
        buttonInfo.show(false);
    });
    msgBus.subscribe("endPicker", function(){
        buttonInfo.show(true);
    });
    return {};
});
