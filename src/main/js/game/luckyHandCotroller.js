define([
    'skbJet/component/gladPixiRenderer/gladPixiRenderer',
    'skbJet/component/gameMsgBus/GameMsgBus',
    'game/configController',
    'game/component/callbackFunc',
    'game/utils/gameUtils',
    "skbJet/component/pixiResourceLoader/pixiResourceLoader",
    'game/component/LuckyHand',
    'skbJet/component/SKBeInstant/SKBeInstant'
],function (gr, msgBus, config, CallbackFunc, gameUtils, loader, LuckyHand, SKBeInstant) {
    //'use strict';

    // const KeyFrameAnimation = require('skbJet/component/gladPixiRenderer/KeyFrameAnimation');
    // const TweenFunctions = require('game/utils/tweenFunctions');
    const cardAnimPlaySpeed = 1;

    function LuckyHandController() {
        this.cardInterval = 100;
        this.LuckyHand = null;
        this.handData = null;
        this.record = {};
        this.addListeners();
        this.isPortrait = false;        
    }

    LuckyHandController.prototype.init = function () {
        gr.lib._luckyHandTitle.autoFontFitText = true;
        gr.lib._luckyHandTitle.setText(loader.i18n.Game.luckyHand);

        gr.lib._luckyHandInfo_P.autoFontFitText = true;
        gr.lib._luckyHandInfo_P.setText(loader.i18n.Game.luckyHandBonusInfo_P);

        gr.lib._luckyHandInfo.autoFontFitText = true;
        gr.lib._luckyHandInfo.setText(loader.i18n.Game.luckyHandBonusInfo);

        for (let i = 2; i < 6; i++) {
            gr.lib['_L_match'+i+'_lable'].autoFontFitText = true;
            gr.lib['_L_match'+i+'_lable'].setText(loader.i18n.Game.match+i);
        }

        this.getConfigParameter();
        this.getOriginal();

        let cardNames = [];
        for(let i=0; i<5; i++){
            cardNames.push('_luckyHand_'+i);
        }
        this.LuckyHand = new LuckyHand({
            cardInterval: this.cardInterval,
            BGAnim: "cardBackFlip_LuckyHand",
            playAnimSpeed:cardAnimPlaySpeed,
            symbolNames:cardNames            
        });

        this.reset();
        // this.titleTransitionAnimation();
    };

    LuckyHandController.prototype.reset = function(){
        if(gr.lib._luckyHand._currentStyle._opacity === 1&&this.LuckyHand){
            this.LuckyHand.reset();
            this.record = {};
            gr.animMap._luckyHandTrans_0.updateStyleToTime(0);
            gr.animMap._luckyHandTrans_1.updateStyleToTime(0);
        }
    };

    LuckyHandController.prototype.startRevealAll = function(){
        const _this = this;
        gr.animMap._luckyHandTrans_1._onComplete = function(){
            gr.getTimer().setTimeout(function(){
                _this.LuckyHand.playAnim();
            },600);
        };
        gr.animMap._luckyHandTrans_0._onComplete = function(){
            gameUtils.playSoundByConfig("LuckyHandTransition");
            gr.animMap._luckyHandTrans_1.play();       
            // _this.titleTransAnim.play();
        };
        gr.animMap._luckyHandTrans_0.play();
    };

     LuckyHandController.prototype.getOriginal = function(){
        function setFontOriginal(symbol){
            symbol.originalFontsize = symbol._currentStyle._font._size;
            symbol.originalFontColor = symbol._currentStyle._text._color;
        }

        for(let index=2; index< 6; index++){
            setFontOriginal(gr.lib['_L_match'+index+'_lable']);
            setFontOriginal(gr.lib['_L_match'+index+'_value']);
        }        
    };

    LuckyHandController.prototype.getConfigParameter = function(){
        if (SKBeInstant.config.customBehavior) {            
            if (SKBeInstant.config.customBehavior.hasOwnProperty('luckyHandCardInterval')) {
                this.cardInterval = Number(SKBeInstant.config.customBehavior.luckyHandCardInterval);
            }
        } else if (loader.i18n.gameConfig) {
            if (loader.i18n.gameConfig.hasOwnProperty('luckyHandCardInterval')) {
                this.cardInterval = Number(loader.i18n.gameConfig.luckyHandCardInterval);
            }
        }
    };

    LuckyHandController.prototype.onStartUserInteraction = function(data){
        //data.scenario = "42,26,30,13,41|39,52,36,45,10|17,32,50,24,47|49,28,51,43,18|22,20,35,48,44|31,6,19,21,4|25,21,6,4,29|4|29,9,10,47,4,38,12,41,14,32,52,2";
        const scenario = data.scenario;
        const parts = scenario.split("|");
        let splitData = [];
        for(let i=0; i<7; i++){
            splitData.push(parts[i].split(","));
        }
        let pokerAnim = [];
        this.checkHandType(splitData,pokerAnim);
        this.LuckyHand.setPockerCard(pokerAnim);

        this.LuckyHand.setHitArray(this.record);
    };
    
    LuckyHandController.prototype.onOrientChange = function(isPortrait){
        this.isPortrait = isPortrait;
    };
    LuckyHandController.prototype.checkHandType = function(parts, pokerAnim){
        this.handData = parts[6];

        for(let i= 0; i<this.handData.length; i++){
            const pokerNum = this.handData[i];
            const rankIndex = pokerNum%13;
            const suitIndex = pokerNum%13 === 0? Math.floor(pokerNum/13)-1: Math.floor(pokerNum/13);
            pokerAnim.push(config.gamePocker.baseGameRank[rankIndex]+config.gamePocker.baseGameSuits[suitIndex]);
            
            for(let j=0; j<6;j++){
                let baseHandData = parts[j];
                const index = baseHandData.indexOf(pokerNum);
                if(index > -1){
                    if(!this.record[j]){
                        this.record[j] = [];
                    }
                    this.record[j].push({baseIndex: index, luckyIndex:i});
                }
            }
        }
      };
      LuckyHandController.prototype.onBuyOrTryHaveClicked = function(){
        this.reset();
      };

      LuckyHandController.prototype.addListeners = function () {
        msgBus.subscribe('SKBeInstant.gameParametersUpdated', new CallbackFunc(this, this.init));
        msgBus.subscribe('jLottery.reStartUserInteraction', new CallbackFunc(this, this.onStartUserInteraction));
		msgBus.subscribe('jLottery.startUserInteraction', new CallbackFunc(this, this.onStartUserInteraction));
		msgBus.subscribe('startLuckyHand', new CallbackFunc(this, this.startRevealAll));
        msgBus.subscribe('ticketCostChanged', new CallbackFunc(this, this.reset));
        msgBus.subscribe('changeBackgroundBGIfPortrait', new CallbackFunc(this, this.onOrientChange));
        msgBus.subscribe("buyOrTryHaveClicked",new CallbackFunc(this, this.onBuyOrTryHaveClicked));


        // msgBus.subscribe('changeBackgroundBGIfPortrait', new CallbackFunc(this, this.changeBackgroundBGIfPortrait));

        // msgBus.subscribe('jLottery.reInitialize', new CallbackFunc(this, this.onReInitialize));
        // msgBus.subscribe('jLottery.reStartUserInteraction', new CallbackFunc(this, this.onReStartUserInteraction));
        // msgBus.subscribe('jLottery.startUserInteraction', new CallbackFunc(this, this.onStartUserInteraction));
        // msgBus.subscribe('jLottery.enterResultScreenState', new CallbackFunc(this, this.onEnterResultScreenState));
        // msgBus.subscribe('winboxError', new CallbackFunc(this, this.onWinBoxError));
        // msgBus.subscribe('jLottery.beginNewGame', new CallbackFunc(this, this.onBeginNewGame));
    };
    return LuckyHandController;
});