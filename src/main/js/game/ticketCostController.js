define([
    'skbJet/component/gladPixiRenderer/Sprite',
    'skbJet/component/gameMsgBus/GameMsgBus',
    // 'skbJet/component/howlerAudioPlayer/howlerAudioSpritePlayer',
    'skbJet/component/gladPixiRenderer/gladPixiRenderer',
    'skbJet/component/pixiResourceLoader/pixiResourceLoader',
    'skbJet/component/SKBeInstant/SKBeInstant',
    'skbJet/componentCRDC/gladRenderer/gladButton',
    'game/utils/gameUtils',
    'game/configController'
], function (Sprite, msgBus,/* audio,*/ gr, loader, SKBeInstant, gladButton, gameUtils, config) {
    
    var plusButton, minusButton;
    var _currentPrizePoint, prizePointList;
    var ticketIcon, ticketIconObj = null;
    var boughtTicket = false;
    var MTMReinitial = false;
    var SKBDesktop = false;
    
    function registerControl() {
        var formattedPrizeList = [];
        var strPrizeList = [];
        for (var i = 0; i < prizePointList.length; i++) {
            formattedPrizeList.push(SKBeInstant.formatCurrency(prizePointList[i]).formattedAmount);
            strPrizeList.push(prizePointList[i] + '');
        }
        var priceText, stakeText;
        if(SKBeInstant.isWLA()){
            priceText = loader.i18n.MenuCommand.WLA.price;
            stakeText = loader.i18n.MenuCommand.WLA.stake;
        }else{
            priceText = loader.i18n.MenuCommand.Commercial.price;
            stakeText = loader.i18n.MenuCommand.Commercial.stake;            
        }
        
        msgBus.publish("jLotteryGame.registerControl", [{
                name: 'price',
                text: priceText,
                type: 'list',
                enabled: 1,
                valueText: formattedPrizeList,
                values: strPrizeList,
                value: SKBeInstant.config.gameConfigurationDetails.pricePointGameDefault
            }]);
        msgBus.publish("jLotteryGame.registerControl", [{
            name: 'stake',
            text: stakeText,
            type: 'stake',
            enabled: 0,
            valueText: '0',
            value: 0
        }]);
    }
    
    function gameControlChanged(value) {
        msgBus.publish("jLotteryGame.onGameControlChanged",{
            name: 'stake',
            event: 'change',
            params: [SKBeInstant.formatCurrency(value).amount/100, SKBeInstant.formatCurrency(value).formattedAmount]
        });
        
        msgBus.publish("jLotteryGame.onGameControlChanged",{
            name: 'price',
            event: 'change',
            params: [value, SKBeInstant.formatCurrency(value).formattedAmount]
        });
    }
    
    function onConsoleControlChanged(data){
        if (data.option === 'price') {
            setTicketCostValue(Number(data.value));
            
            msgBus.publish("jLotteryGame.onGameControlChanged", {
                name: 'stake',
                event: 'change',
                params: [SKBeInstant.formatCurrency(data.value).amount/100, SKBeInstant.formatCurrency(data.value).formattedAmount]
            });
        }
    }

    function onGameParametersUpdated() {
        if (config.style.ticketCostValue) {
            gameUtils.setTextStyle(gr.lib._ticketCostValue, config.style.ticketCostValue);
        }
        if (config.textAutoFit.ticketCostValue){
            gr.lib._ticketCostValue.autoFontFitText = config.textAutoFit.ticketCostValue.isAutoFit;
        }
        
        prizePointList = [];
        ticketIcon = {};

        var style = {
            "_id": "_dfgbka",
            "_name": "_ticketCostLevelIcon_",
            "_SPRITES": [],
            "_style": {
                "_width": "13",
                "_height": "13",
                "_left": "196",
                "_background": {
                    "_imagePlate": "_pricePointIndicatorInactive"
                },
                "_top": "60",
                "_transform": {
                    "_scale": {
                        "_x": "1",
                        "_y": "1"
                    }
                }
            }
        };
		
        if (config.style.ticketCostLevelIcon) {
            for (var key in config.style.ticketCostLevelIcon) {
                if (style._style[key]) {
                    style._style[key] = config.style.ticketCostLevelIcon[key];
                }
            }
        }
                
        var length = SKBeInstant.config.gameConfigurationDetails.revealConfigurations.length;
        var width = Number(style._style._width) * Number(style._style._transform._scale._x);
        var space = 0;
        var left = (gr.lib._ticketCost._currentStyle._width - (length * width + (length - 1) * space)) / 2;
        for (var i = 0; i < length; i++) {
            var spData = JSON.parse(JSON.stringify(style));
            spData._id = style._id + i;
            spData._name = spData._name + i;
            spData._style._left = left + (width + space) * i;
            var sprite = new Sprite(spData);
            gr.lib._ticketCost.pixiContainer.addChild(sprite.pixiContainer);

            var price = SKBeInstant.config.gameConfigurationDetails.revealConfigurations[i].price;
            prizePointList.push(price);
            ticketIcon[price] = "_ticketCostLevelIcon_" + i;
		}
        if(prizePointList.length === 1 || Number(SKBeInstant.config.jLotteryPhase) === 1){
            gr.lib._ticketCost.show(false);
            moveButton(SKBeInstant.getGameOrientation() === "portrait");
        }
        var scaleType = {'scaleXWhenClick': 0.92, 'scaleYWhenClick': 0.92, 'avoidMultiTouch':true};       
		var arrowPlusType = {'scaleXWhenClick': -0.92, 'scaleYWhenClick': 0.92, 'avoidMultiTouch':true};
        if(config.gameParam.arrowPlusSpecial){
            arrowPlusType = scaleType;
        }
        plusButton = new gladButton(gr.lib._ticketCostPlus, config.gladButtonImgName.ticketCostPlus, arrowPlusType);
        gameUtils.setButtonHitArea(gr.lib._ticketCostPlus, config.gladButtonImgName.ticketCostPlus);
        
        minusButton = new gladButton(gr.lib._ticketCostMinus, config.gladButtonImgName.ticketCostMinus, scaleType);        
        gameUtils.setButtonHitArea(gr.lib._ticketCostMinus, config.gladButtonImgName.ticketCostMinus);
        
        registerControl();
        if(prizePointList.length <= 1){
            for (let key in ticketIcon){
                gr.lib[ticketIcon[key]].show(false);
            }
            plusButton.show(false);
            minusButton.show(false);
        }else{
            plusButton.show(true);
            minusButton.show(true);

            plusButton.click(increaseTicketCost);
            minusButton.click(decreaseTicketCost);
        }
		if(SKBeInstant.config.gameType !== 'ticketReady'){
			setDefaultPricePoint();
		}
        gameUtils.fixMeter(gr);
    }

    function setTicketCostValue(prizePoint) {
        // var index = prizePointList.indexOf(prizePoint);
        // if (index < 0) {
        //     msgBus.publish('error', 'Invalide prize point ' + prizePoint);
        //     return;
        // }

        // plusButton.enable(true);
        // minusButton.enable(true);        
        
        // if (index === 0) {
        //     minusButton.enable(false);
        // } 
        
        // if (index === (prizePointList.length - 1)) {
        //     plusButton.enable(false);
        // } 
        _currentPrizePoint = prizePoint;
        enableButton();
        
        var valueString = SKBeInstant.formatCurrency(prizePoint).formattedAmount;

        if(SKBeInstant.config.wagerType === 'BUY'){
            gr.lib._ticketCostValue.setText(valueString);
        }else{
            gr.lib._ticketCostValue.setText(loader.i18n.Game.demo +  valueString);
        }         
      
        if (ticketIconObj) {
            ticketIconObj.setImage('pricePointIndicatorInactive');
        }
        ticketIconObj = gr.lib[ticketIcon[prizePoint]];
        ticketIconObj.setImage('pricePointIndicatorActive');
        
        msgBus.publish('ticketCostChanged', prizePoint);
    }
    
    function setTicketCostValueWithNotify(prizePoint){
        setTicketCostValue(prizePoint);
        gameControlChanged(prizePoint);
    }

    function increaseTicketCost() {
        var index = prizePointList.indexOf(_currentPrizePoint);
        index++;
        setTicketCostValueWithNotify(prizePointList[index]);
        if(index === prizePointList.length-1){
            gameUtils.playSoundByConfig("ButtonBetMax");
            // if(config.audio && config.audio.ButtonBetMax){
            //     audio.play(config.audio.ButtonBetMax.name, config.audio.ButtonBetMax.channel);
            // }
        }else{
            gameUtils.playSoundByConfig("ButtonBetUp");
            // if (config.audio && config.audio.ButtonBetUp) {
			// 	var betUpChannel = config.audio.ButtonBetUp.channel;
			// 	if(Array.isArray(betUpChannel)){
			// 		audio.play(config.audio.ButtonBetUp.name, betUpChannel[index % betUpChannel.length]);
			// 	}else{
			// 		audio.play(config.audio.ButtonBetUp.name, betUpChannel);
			// 	}
            // }
        }
    }

    function decreaseTicketCost() {
        var index = prizePointList.indexOf(_currentPrizePoint);
        index--;
        setTicketCostValueWithNotify(prizePointList[index]);
        gameUtils.playSoundByConfig("ButtonBetDown");
        // if (config.audio && config.audio.ButtonBetDown) {
		// 	var betDownChannel = config.audio.ButtonBetDown.channel;
		// 	if(Array.isArray(betDownChannel)){
		// 		audio.play(config.audio.ButtonBetDown.name, betDownChannel[index % betDownChannel.length]);
		// 	}else{
		// 		audio.play(config.audio.ButtonBetDown.name, betDownChannel);
		// 	}
        // }
    }

    function setDefaultPricePoint() {
        setTicketCostValueWithNotify(SKBeInstant.config.gameConfigurationDetails.pricePointGameDefault);
    }

    function onReInitialize() {
        if(MTMReinitial){
            enableConsole();
            if(_currentPrizePoint){
                setTicketCostValueWithNotify(_currentPrizePoint);
            }else{
                setDefaultPricePoint();
            }
            boughtTicket = false;
            MTMReinitial = false;            
        }else{
            onReset();
        }

    }
    
    function onReset(){
        enableConsole();
        if(_currentPrizePoint){
            setTicketCostValueWithNotify(_currentPrizePoint);
        }else{
            setDefaultPricePoint();
        }
        boughtTicket = false;
    }

    function onStartUserInteraction(data) {
        disableConsole();
        boughtTicket = true;
        if (data.price) {
            _currentPrizePoint = data.price;
            setTicketCostValueWithNotify(_currentPrizePoint);
        } 
        plusButton.enable(false);
        minusButton.enable(false);

        gr.lib._ticketCost.updateCurrentStyle({"_opacity":config.Opacity});
        msgBus.publish('ticketCostChanged', _currentPrizePoint);
    }

    function onReStartUserInteraction(data) {
        onStartUserInteraction(data);
    }

    function enableConsole(){
        msgBus.publish('toPlatform',{
            channel:"Game",
            topic:"Game.Control",
            data:{"name":"price","event":"enable","params":[1]}
        });
    } 
    function disableConsole(){
        msgBus.publish('toPlatform',{
            channel:"Game",
            topic:"Game.Control",
            data:{"name":"price","event":"enable","params":[0]}
        });
    }

    function onBeginNewGame() {
        if (Number(SKBeInstant.config.jLotteryPhase) === 2) {
            boughtTicket = false;
            enableConsole();
            enableButton();            
            // setTicketCostValueWithNotify(_currentPrizePoint);
        }
    }
    
    function onTutorialIsShown(){
        if(!boughtTicket){            
            disableButton();
            disableConsole();
        }
    }

    function disableButton(){
        plusButton.enable(false);
        minusButton.enable(false);
        gr.lib._ticketCost.updateCurrentStyle({"_opacity":config.Opacity});
    }

    function enableButton(){
        const index = prizePointList.indexOf(_currentPrizePoint);
        if(index === 0){
            plusButton.enable(true);
            minusButton.enable(false);
        }else if(index === prizePointList.length-1){
            plusButton.enable(false);
            minusButton.enable(true);
        }else{
            plusButton.enable(true);
            minusButton.enable(true);
        }
        gr.lib._ticketCost.updateCurrentStyle({ "_opacity": 1});
    }
    function onTutorialIsHide(){
        if(!boughtTicket){
            enableButton();
            enableConsole();          
        }
    }
    // function onDisableUI(){
    //     plusButton.enable(false);
    //     minusButton.enable(false);
    // }
    
    function onPlayerWantsToMoveToMoneyGame(){
        MTMReinitial = true;
        disableButton();
        disableConsole();
    }

    function moveButton(isPortrait){
        if((prizePointList && prizePointList.length === 1) || (Number(SKBeInstant.config.jLotteryPhase) === 1)){
            const diff = 2;
            if(!isPortrait || SKBDesktop){
                if(!gr.lib._buy.originalLeft){
                    gr.lib._buy.originalLeft = Number(gr.lib._buy._currentStyle._left);
                    gr.lib._bonusPlay.originalLeft = Number(gr.lib._bonusPlay._currentStyle._left);
                }
                gr.lib._buy.updateCurrentStyle({"_left":gr.lib._buy.originalLeft - Number(gr.lib._ticketCost._currentStyle._width)/2 -diff});
                gr.lib._bonusPlay.updateCurrentStyle({"_left":gr.lib._bonusPlay.originalLeft - Number(gr.lib._ticketCost._currentStyle._width)/2 -diff});
                gr.lib._try.updateCurrentStyle({"_left":(1440-Number(gr.lib._try._currentStyle._width))/2});
            }            
        }
    }

    function onSystemInit(data){
        if(data.serverConfig.channel ==='INT'){
            SKBDesktop = true;
        }
    }

    msgBus.subscribe('platformMsg/Kernel/System.Init', onSystemInit);
    msgBus.subscribe('jLottery.reStartUserInteraction', onReStartUserInteraction);
    // msgBus.subscribe('jLottery.initialize', onInitialize);
    msgBus.subscribe('jLottery.beginNewGame', onBeginNewGame);
    msgBus.subscribe('jLottery.reInitialize', onReInitialize);
    msgBus.subscribe('jLottery.startUserInteraction', onStartUserInteraction);
    msgBus.subscribe('SKBeInstant.gameParametersUpdated', onGameParametersUpdated);
    msgBus.subscribe('jLotterySKB.onConsoleControlChanged', onConsoleControlChanged);
    msgBus.subscribe('jLotterySKB.reset', onReset);
    msgBus.subscribe('tutorialIsShown', onTutorialIsShown);
    msgBus.subscribe('tutorialIsHide', onTutorialIsHide);
    // msgBus.subscribe('disableUI', onDisableUI);
    msgBus.subscribe('jLotteryGame.playerWantsToMoveToMoneyGame',onPlayerWantsToMoveToMoneyGame);
    msgBus.subscribe('changeBackgroundBGIfPortrait', moveButton);
    
    msgBus.subscribe('buyOrTryHaveClicked',function(){
        disableConsole();
        plusButton.enable(false);
        minusButton.enable(false);
    });

    msgBus.subscribe("startPicker", function(){
        if(prizePointList.length !== 1 && (Number(SKBeInstant.config.jLotteryPhase) !== 1)){
            gr.lib._ticketCost.show(false);
        }
    });
    msgBus.subscribe("endPicker", function(){
        if(prizePointList.length !== 1 && (Number(SKBeInstant.config.jLotteryPhase) !== 1)){
            gr.lib._ticketCost.show(true);
        }
    });
    
    return {};
});