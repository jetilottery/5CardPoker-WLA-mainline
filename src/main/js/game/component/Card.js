define([
    'skbJet/component/gladPixiRenderer/gladPixiRenderer',
    'skbJet/component/gameMsgBus/GameMsgBus',
    'com/pixijs/pixi',
    'game/utils/gameUtils'
],function (gr, msgBus, PIXI, gameUtils) {
     'use strict';
    function Card(data) {
        this.symbol = null;
        this.cardName = null;
        this.BGAnim = null;
        this.playAnimSpeed = null;
        this.pockerAnim = null;
        this.callBack = null;
        this.belongHand = null;
        // this.playHandAnim = false;
        this.init(data);
    }

    Card.prototype.reset = function () {
        this.symbol.setImage(this.BGAnim + "_00");
    };

    Card.prototype.enable = function(){
        this.symbol.pixiContainer.interactive = true;
    };
    Card.prototype.disable = function(){
        this.symbol.pixiContainer.interactive = false;
    };

    Card.prototype.status = function(){
        return this.symbol.pixiContainer.interactive;
    };

    Card.prototype.addEvent = function(){
        const _this = this;
        this.symbol.on('click', function () {
            _this.clickCard();
        });
    };

    Card.prototype.init = function (data) {
        this.cardName = data.name;
        this.symbol = gr.lib[data.name];
        this.symbol.pixiContainer.cursor = "pointer";
        this.BGAnim = data.BGAnim;
        this.playAnimSpeed = data.playAnimSpeed;
        this.callBack = data.cardCallBack;
        this.belongHand = data.belongHand;
        // this.playHandAnim = data.playHandAnim;
        this.symbol.pixiContainer.$sprite.hitArea = new PIXI.Rectangle(59,32,132,188);
        const _this = this;
        if(data.addEvent){
            this.addEvent();
            this.disable();
        }

        this.symbol.onComplete = function () {
            if (_this.symbol.pixiContainer.$sprite.animName === _this.BGAnim) {
                _this.symbol.gotoAndPlay(_this.pockerAnim, _this.playAnimSpeed);
            } else if(_this.symbol.pixiContainer.$sprite.animName === _this.pockerAnim){
                _this.callBack.call(_this.belongHand,{cardName:_this.cardName, pockerAnim:_this.pockerAnim});
            } else if(_this.symbol.pixiContainer.$sprite.animName === _this.pockerAnim+"R"){
                _this.symbol.gotoAndPlay(_this.BGAnim+"R", 1);
            // }else if(_this.symbol.pixiContainer.$sprite.animName === _this.BGAnim+"R"){
                // _this.pockerAnim = null;
            }
        };
        // this.addListeners();
    };

    Card.prototype.clickCard = function () {
        if(gr.lib._tutorial.pixiContainer.visible){
            return;
        }
        this.disable();
        gameUtils.playSoundByConfig("CardFlip");
        msgBus.publish("clickedCard");
        this.playAnim();
    };
    Card.prototype.playAnim = function(){
        this.symbol.gotoAndPlay(this.BGAnim, this.playAnimSpeed);
    };

    Card.prototype.setStyle = function(newStyle){
        this.symbol.updateCurrentStyle(newStyle);
    };
    
    // Card.prototype.onBeginNewGame = function(){
    //     this.pockerAnim = null;
    // };

    Card.prototype.playReverseAnim = function(){
        if(this.pockerAnim){
            this.symbol.gotoAndPlay(this.pockerAnim+"R", 1);        
        }else{
            this.reset();
        }
    };
    // Card.prototype.addListeners = function (){
    //     msgBus.subscribe('ticketCostChanged', new CallbackFunc(this, this.reset));

    // 	// msgBus.subscribe('jLottery.reInitialize', new CallbackFunc(this, this.onReInitialize));
    // 	// msgBus.subscribe('jLottery.reStartUserInteraction', new CallbackFunc(this, this.onReStartUserInteraction));
    // 	// msgBus.subscribe('jLottery.startUserInteraction', new CallbackFunc(this, this.onStartUserInteraction));
    // 	// msgBus.subscribe('jLottery.enterResultScreenState', new CallbackFunc(this, this.onEnterResultScreenState));
    // 	// msgBus.subscribe('winboxError', new CallbackFunc(this, this.onWinBoxError));
        // msgBus.subscribe('jLottery.beginNewGame', new CallbackFunc(this, this.onBeginNewGame));
    // 	// msgBus.subscribe('changeBackgroundBGIfPortrait', new CallbackFunc(this, this.changeBackgroundBGIfPortrait));
    // };

    return Card;
});