define([
    'skbJet/component/gladPixiRenderer/gladPixiRenderer',
    'skbJet/component/gameMsgBus/GameMsgBus',
    'game/component/callbackFunc',
    'game/utils/gameUtils',
    'game/component/Card',
    'game/component/storePrize',
    "skbJet/component/pixiResourceLoader/pixiResourceLoader",
    'skbJet/component/SKBeInstant/SKBeInstant'
],function(gr, msgBus, CallbackFunc, gameUtils, Card, storePrize, loader, SKBeInstant) {
    'use strict';

    function Hand(data){
        this.cards = [];
        this.handNum = null;
        this.clickedCardNum = 0;
        this.resetDone = false;
        this.winType = null;
        this.cardInterval = 0;
        this.revealed = false;
        this.triggerBonus = false;
        this.revealAll =false;
        this.cardsDone = false;
        this.done = false;
        this.init(data);
    }
    
    Hand.prototype.init = function(data){
        this.handNum = data.handNum;
        this.cardInterval = data.cardInterval;
        this.eventSymbol = gr.lib["_event"+this.handNum];
        this.eventSymbol.pixiContainer.cursor = "pointer";

        let cardConfig = {
            BGAnim: data.BGAnim,
            playAnimSpeed:data.playAnimSpeed,
            cardCallBack: this.oneCardDone,
            belongHand:this
            // playHandAnim:true
        };
        
        data.symbolNames.forEach(name => {
            cardConfig.name = name;
            this.cards.push(new Card(cardConfig));
        });
        this.cloneAnim();
        this.reset();
        this.addListeners();
        this.addEvent();
        this.disable();
    };

    Hand.prototype.cloneAnim = function () {
        if (this.handNum != 0) {
            gr.animMap._handWinAnim_0.clone(["_win" + this.handNum], "_handWinAnim_" + this.handNum);
            let array = [];
            for (let i = 0; i < 5; i++) {
                array.push("_hand" + this.handNum + "_" + i);
            }
            gr.animMap._idle0.clone(array, "_idle" + this.handNum);
        }
    };

    Hand.prototype.oneCardDone = function(){
        this.clickedCardNum++;
        if(this.clickedCardNum >= this.cards.length){            
            this.allCardsDone(this.handNum);
        }
    };

    Hand.prototype.setTriggerBonus = function(){
        this.triggerBonus = true;
    };
    Hand.prototype.allCardsDone = function(){
        if(this.winboxError){
            return;
        }
        this.cardsDone = true;
        
        if(this.triggerBonus){
            this.playwinLuckyAnim();
        }else{
            if(this.winType){
                if(this.revealAll){
                    msgBus.publish("oneHandDone");
                }else{
                    this.showWinAnim();
                }
            }else{
                this.done = true;
                msgBus.publish("oneHandDone");
                if(!this.revealAll){
                    msgBus.publish("addIdle");
                } 
            }
        }
     
    };

    Hand.prototype.showWinAnim = function(){
        if(this.winboxError){
            return;
        }
        if(this.winType&&!gr.lib['_winBG'+this.handNum].pixiContainer.visible){
            gameUtils.playSoundByConfig("PrizeHandMatch");
            gameUtils.resetSpine(gr.lib['_winBG'+this.handNum].spine);
            gr.lib['_winBG'+this.handNum].show(true);
            gr.lib['_winBG'+this.handNum].spine.state.setAnimation(0,"winningHandEffect",true);
            gr.animMap["_handWinAnim_" + this.handNum].play();
            msgBus.publish('updateWinValue', storePrize.addTotalWin(storePrize.getBaseWinPrize()[this.winType]));
            this.done = true;
            if(!this.revealAll){
                msgBus.publish("oneHandDone");
                msgBus.publish("addIdle");
            }
        }

    };

    Hand.prototype.playAnim = function(){
        if(gr.lib._prizeTable.pixiContainer.visible || this.winboxError){
            return;
        }
        this.revealed = true;
        msgBus.publish("handStartReveal",this.handNum);
        let i = 0;
        let _this = this;
        // if(this.revealAll){
            gameUtils.playSoundByConfig("5CardFlip");
        // }
        this.cards.forEach(card => {            
            // card.disable();
            gr.getTimer().setTimeout(function(){
                if(this.winboxError){
                    return;
                }
                // if(!_this.revealAll){
                //     gameUtils.playSoundByConfig("CardFlip");
                // }
                card.playAnim();
            }, (i++) * _this.cardInterval);
        });
    };

    Hand.prototype.playwinLuckyAnim = function(){
        gameUtils.playSoundByConfig("GoldenChip");
        gr.lib['_winLuckyAnim'+this.handNum].spine.scale.x = 0.8;
        gr.lib['_winLuckyAnim'+this.handNum].spine.scale.y = 0.8;
        gameUtils.resetSpine(gr.lib['_winLuckyAnim'+this.handNum].spine);
        gr.lib['_winLucky'+this.handNum].show(true);
        const _this = this;
        
        gr.lib['_winLuckyAnim'+this.handNum].spine.state.setAnimation(0,"chip_Intro").listener={
            complete:function(){        
                if(_this.winboxError){
                    return;
                }
                gr.lib['_winLuckyAnim'+_this.handNum].spine.scale.x = 1;
                gr.lib['_winLuckyAnim'+_this.handNum].spine.scale.y = 1;
                gr.lib['_winLuckyAnim'+_this.handNum].spine.state.setAnimation(0,"chip_Loop",true);
                gr.lib['_winLucyBanner'+_this.handNum].show(true);
                if(!_this.revealAll){                    
                    msgBus.publish("startLuckyBonusPicker");
                }
                _this.done = true;
                msgBus.publish("oneHandDone");
            }
        };
    };

    Hand.prototype.reset = function(){
        if(!this.resetDone){
            this.resetDone = true;
            this.winboxError = false;
            // this.triggerBonus = false;
            this.cardsDone = false;           
            this.done = false;
            this.revealed = false;
            this.revealAll =false;
            this.clickedCardNum = 0;
            this.cards.forEach(card => card.playReverseAnim());
            gr.lib['_winBG'+this.handNum].show(false);
            gr.lib['_winLucky'+this.handNum].show(false);
            // gr.lib['_winLucky'+this.handNum].setImage("bonusChip_Intro_0000");
            gr.lib['_bonusLabel_'+this.handNum].show(false);
            gr.animMap["_handWinAnim_" + this.handNum].updateStyleToTime(0);
            
        }
    };

    Hand.prototype.enable = function(){
        this.eventSymbol.pixiContainer.interactive = true;
    };
    Hand.prototype.disable = function(){        
        this.eventSymbol.pixiContainer.interactive = false;
    };

    Hand.prototype.setPockerCard = function(pockerAnim){
        for(let i= 0; i<pockerAnim.length; i++){
            this.cards[i].pockerAnim =pockerAnim[i];
        }        
    };

    Hand.prototype.setWinType = function(winType){
        this.winType = winType;
    };

    Hand.prototype.onBeginNewGame= function(){
        this.resetDone = false;
        this.triggerBonus = false;
    };
    Hand.prototype.startRevealAll= function(){
        this.revealAll = true;
    };

    Hand.prototype.addEvent = function () {
        const _this = this;
        gr.lib["_event" + this.handNum].on('mouseover', function () {
            msgBus.publish("stopIdle");
            _this.cards.forEach(card => {
                card.setStyle({ _transform: { _scale: { _x: 0.62, _y: 0.62 } }, _opacity: 0.8});
            });
        });
        gr.lib["_event" + this.handNum].on('mouseout', function () {
            msgBus.publish("addIdle");
            _this.cards.forEach(card => {
                card.setStyle({ _transform: { _scale: { _x: 0.6, _y: 0.6} }, _opacity: 1 });
            });
        });
        gr.lib["_event" + this.handNum].on("click", function () {
            msgBus.publish("stopIdle");
            _this.disable();
            gr.animMap["_idle"+_this.handNum].stop();
            _this.cards.forEach(card => {
                card.setStyle({ _transform: { _scale: { _x: 0.6, _y: 0.6} }, _opacity: 1 });
            });
            _this.playAnim();
        });
    };

    Hand.prototype.updateBonusWin = function(bonusWinValue){
        if(this.triggerBonus){
            gr.lib['_bonusLabel_'+ this.handNum].show(true);
            gr.lib['_winLucky'+ this.handNum].show(false);
            gr.lib['_winLText'+this.handNum].setText(loader.i18n.Game.bonusWin + SKBeInstant.formatCurrency(bonusWinValue).formattedAmount);
            if(SKBeInstant.isWLA()){
                gr.lib['_winPText'+this.handNum].setText(loader.i18n.Game.bonusWin + SKBeInstant.formatCurrency(bonusWinValue).formattedAmount);
            }else{
                gr.lib['_winPText'+this.handNum].setText(loader.i18n.Game.bonusWinHead+loader.i18n.Game.bonusWin + SKBeInstant.formatCurrency(bonusWinValue).formattedAmount);
            }
            // gr.lib['_win'+this.handNum].show(true);
            gr.animMap["_handWinAnim_" + this.handNum].play();
        }
    };
    Hand.prototype.onWinBoxError = function(){
        this.winboxError = true;
    };

    Hand.prototype.onBuyOrTryHaveClicked = function(){
        this.reset();
    };
    
    Hand.prototype.addListeners = function (){
        // msgBus.subscribe('SKBeInstant.gameParametersUpdated', new CallbackFunc(this, this.init));
        msgBus.subscribe('ticketCostChanged', new CallbackFunc(this, this.reset));
        
		// msgBus.subscribe('jLottery.reInitialize', new CallbackFunc(this, this.onReInitialize));
		// msgBus.subscribe('jLottery.reStartUserInteraction', new CallbackFunc(this, this.onReStartUserInteraction));
		// msgBus.subscribe('jLottery.startUserInteraction', new CallbackFunc(this, this.onStartUserInteraction));
		// msgBus.subscribe('jLottery.enterResultScreenState', new CallbackFunc(this, this.onEnterResultScreenState));
		msgBus.subscribe('winboxError', new CallbackFunc(this, this.onWinBoxError));
        msgBus.subscribe('jLottery.beginNewGame', new CallbackFunc(this, this.onBeginNewGame));
        msgBus.subscribe('startRevealAll', new CallbackFunc(this, this.startRevealAll));
        msgBus.subscribe("updateBonusWin",new CallbackFunc(this, this.updateBonusWin));
        msgBus.subscribe("buyOrTryHaveClicked",new CallbackFunc(this, this.onBuyOrTryHaveClicked));
		// msgBus.subscribe('changeBackgroundBGIfPortrait', new CallbackFunc(this, this.changeBackgroundBGIfPortrait));
    };
    
    return Hand;
});