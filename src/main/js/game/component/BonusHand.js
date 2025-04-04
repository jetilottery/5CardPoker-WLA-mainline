define([
    'skbJet/component/gladPixiRenderer/gladPixiRenderer',
    'game/component/callbackFunc',
    'game/component/Card',
    'game/component/storePrize',
    'skbJet/component/gameMsgBus/GameMsgBus',
    'game/utils/gameUtils'
    // 'skbJet/component/SKBeInstant/SKBeInstant'
],function (gr,CallbackFunc,Card, storePrize,msgBus,gameUtils) {
    'use strict';

    function BonusHand(data){
        this.cards = [];
        this.clickedCardNum = 0;
        this.winType = null;
        this.cardInterval = 0;
        this.pickedSuit = null;
        this.hitNum = 0;
        this.isPortrait = false;
        this.revealAllButton = null;
        this.allCardsClicked = false;
        this.init(data);
    }

    // inherit(BonusHand,Hand);

    BonusHand.prototype.init = function(data){
        this.cardInterval = data.cardInterval;
        this.bonusToBaseInterval = data.bonusToBaseInterval;
        this.revealAllButton = data.revealAllButton;

        let cardConfig = {
            BGAnim: data.BGAnim,
            playAnimSpeed:data.playAnimSpeed,
            cardCallBack: this.oneCardDone,
            belongHand:this,
            // playHandAnim:false,
            addEvent:true
        };
        
        data.symbolNames.forEach(name => {
            cardConfig.name = name;
            this.cards.push(new Card(cardConfig));
        });
        // this.highLightMatchAnimation();
        this.clone();
        this.reset();
        this.addListeners();
    };

    BonusHand.prototype.playAnim = function(){
        if(this.winboxError){
            return;
        }
        let i = 0;
        let _this = this;
        this.cards.forEach(card => {
            if(card.status()){
                card.disable();
                gr.getTimer().setTimeout(function(){
                    if(this.winboxError){
                        return;
                    }
                    card.playAnim();
                }, (i++) * _this.cardInterval);
            }
        });
    };

    BonusHand.prototype.recoverPrize = function(index){
        gr.animMap["_match_"+index+"_Anim"].stop();
        gr.lib['_match_BG'+index].stopPlay();
        gr.lib['_match_BG'+index].show(false);

        // let fontsize = gr.lib['_match'+index+'_value'].originalFontsize;
        let fontcolor = gr.lib['_match'+index+'_value'].originalFontColor;
        // gr.lib['_match'+index+'_value'].updateCurrentStyle({_font:{_size:fontsize},_text:{"_color":fontcolor}});
        gr.lib['_match'+index+'_value'].updateCurrentStyle({_text:{"_color":fontcolor}});
        gr.lib['_match'+index].updateCurrentStyle({"_transform":{"_scale":{"_x":1,"_y":1}}});

        // let fontsize = gr.lib['_match'+index+'_lable'].originalFontsize;
        fontcolor = gr.lib['_match'+index+'_lable'].originalFontColor;
        gr.lib['_match'+index+'_lable'].updateCurrentStyle({_text:{"_color":fontcolor}});

    };
    BonusHand.prototype.setPockerCard = function(pockerAnim){
        for(let i= 0; i<pockerAnim.length; i++){
            this.cards[i].pockerAnim =pockerAnim[i];
        }        
    };
   
    BonusHand.prototype.clone = function(){
        for(let i=4; i<13; i++){
            gr.animMap._luckyHand_match_2_Anim.clone(["_match"+i], "_match_"+i+"_Anim");
            gr.animMap["_match_"+i+"_Anim"]._onComplete = function(){
                const hitColor = "FFE234";
                // const hitSize = 26;
                gr.lib['_match'+i+'_lable'].updateCurrentStyle({_text:{"_color":hitColor}});
                // gr.lib['_match'+i+'_value'].updateCurrentStyle({_font:{_size:hitSize},_text:{"_color":hitColor}});
                gr.lib['_match'+i+'_value'].updateCurrentStyle({_text:{"_color":hitColor}});
            };
            if(i !== 4){
                gr.animMap._match4_WinAnim.clone(["_match"+i], "_match"+i+"_WinAnim");            
            }
        }
    };

    BonusHand.prototype.enable = function(){
        this.cards.forEach(card => card.enable());
    };
    BonusHand.prototype.disable = function(){        
        this.cards.forEach(card => card.disable());
    };

    BonusHand.prototype.oneCardDone = function(cardInfo){
        if(this.winboxError){
            return;
        }
        const { pockerAnim, cardName } = cardInfo;
        this.clickedCardNum++;
        if(pockerAnim.indexOf(this.pickedSuit)>0){//hit
            gameUtils.playSoundByConfig("SuitMatch");
            const temp = cardName.split("_");
            const index = temp[temp.length-1];
            gameUtils.resetSpine(gr.lib["_lucky_pWin_"+index].spine);
            gr.lib['_lucky_pWin_'+index].show(true);
            // gr.lib['_lucky_pWin_'+index].gotoAndPlay("luckySuitMatch_Effect",0.5,true);
            gr.lib["_lucky_pWin_"+index].spine.state.setAnimation(0,"luckySuitMatch",true);
            if(this.hitNum >=4){
                this.recoverPrize(this.hitNum);
                storePrize.addTotalWin(storePrize.getLuckyBonusWin()[this.hitNum]*-1);
            }
            this.hitNum++;
            if(this.hitNum >= 4){
                gameUtils.playSoundByConfig("PrizeChime_"+(this.hitNum-3));
                gr.animMap["_match_"+this.hitNum+"_Anim"].play();
                gr.lib['_match_BG'+this.hitNum].show(true);
                gr.lib['_match_BG'+this.hitNum].gotoAndPlay("bonusMatchParticles",0.7,true);
                msgBus.publish('updateWinValue',storePrize.addTotalWin(storePrize.getLuckyBonusWin()[this.hitNum]));
            }
        }
        if(this.clickedCardNum >= this.cards.length){            
            this.allCardsDone();
        }
    };

    BonusHand.prototype.setPickedSuit = function(suitName){
        this.pickedSuit = suitName;
        gr.lib._choice_pocker.setImage("choice_"+suitName.substring(0,suitName.length-1));
        this.cards.forEach(card =>{
            card.BGAnim = "cardBackFlip_Bonus"+this.pickedSuit;
            card.symbol.setImage("cardBackFlip_Bonus"+this.pickedSuit + "_00");
        });
    };



    BonusHand.prototype.allCardsDone = function(){
        if(this.winboxError){
            return;
        }
        const _this = this;
        function playTrans(){
            gr.getTimer().setTimeout(function(){                
                // if(_this.isPortrait){
                //     gameUtils.resetSpine(gr.lib._transitionContainer_P.spine);
                //     gr.lib._transitionContainer_P.show(true);
                //     gr.lib._transitionContainer_P.spine.state.setAnimation(0, 'portrait_Transition').listener={
                //         complete:function(){
                //             gr.lib._transitionContainer_P.show(false);
                //         }
                //     };
                // }else{
                //     gameUtils.resetSpine(gr.lib._transitionContainer.spine);
                //     gr.lib._transitionContainer.show(true);
                //     gr.lib._transitionContainer.spine.state.setAnimation(0, 'landscape_Transition').listener={
                //         complete:function(){
                //             gr.lib._transitionContainer.show(false);
                //         }
                //     };
                // }
                if(this.winboxError){
                    return;
                }
                gr.animMap._bonusToBase._onComplete = function(){
                    // gameUtils.playSoundByConfig("baseGameLoop",true);
                    // audio.volume(0,0.5);
                    msgBus.publish("backToBaseDone");
                };
                
                gr.animMap._bonusToBase.play();
                gr.lib._buy.show(true);
            },_this.bonusToBaseInterval);
        }
        if (this.hitNum >= 4) {
            gr.animMap['_match'+this.hitNum+"_WinAnim"]._onComplete = function(){
                gameUtils.playSoundByConfig("FinalPrizeChime");
                playTrans();
            };
            gr.animMap['_match'+this.hitNum+"_WinAnim"].play();
            msgBus.publish("updateBonusWin", storePrize.getLuckyBonusWin()[this.hitNum]);
        }else{
            playTrans();
        }
    };

    BonusHand.prototype.reset = function () { 
        this.hitNum = 0;
        this.clickedCardNum = 0;
        this.allCardsClicked = false;
        this.winboxError = false;
        this.cards.forEach(card => {
            card.reset(); 
            card.disable();
        });
        for (let i = 0; i < this.cards.length; i++) {
            gr.lib['_lucky_pWin_' + i].show(false);
        }
        for(let i=4; i<13;i++){
            this.recoverPrize(i);
        }
    };

    BonusHand.prototype.clickedCard = function(){
        for(const card of this.cards){
            if(card.status()){
                return;
            }
        }
        this.allCardsClicked = true;
        this.revealAllButton.show(false);
        // this.revealAllButton.enable(false);
        msgBus.publish("disableButtonInfo");
    };
    BonusHand.prototype.onWinBoxError = function(){
        this.winboxError = true;
        this.cards.forEach(card => {
            card.disable();
        });        
    };

    BonusHand.prototype.onTutorialIsShown = function(){
        this.cards.forEach(card => {
            card.symbol.pixiContainer.cursor = "default";
        }); 
    };
    BonusHand.prototype.onTutorialIsHide = function(){
        this.cards.forEach(card => {
            card.symbol.pixiContainer.cursor = "pointer";
        }); 
    };

    BonusHand.prototype.addListeners = function (){
        // msgBus.subscribe('SKBeInstant.gameParametersUpdated', new CallbackFunc(this, this.init));
        // msgBus.subscribe('ticketCostChanged', new CallbackFunc(this, this.reset));
        
		// msgBus.subscribe('jLottery.reInitialize', new CallbackFunc(this, this.onReInitialize));
		// msgBus.subscribe('jLottery.reStartUserInteraction', new CallbackFunc(this, this.onReStartUserInteraction));
		// msgBus.subscribe('jLottery.startUserInteraction', new CallbackFunc(this, this.onStartUserInteraction));
		// msgBus.subscribe('jLottery.enterResultScreenState', new CallbackFunc(this, this.onEnterResultScreenState));
		msgBus.subscribe('winboxError', new CallbackFunc(this, this.onWinBoxError));
		msgBus.subscribe('jLottery.beginNewGame', new CallbackFunc(this, this.reset));
		msgBus.subscribe('clickedCard', new CallbackFunc(this, this.clickedCard));
		msgBus.subscribe('tutorialIsShown', new CallbackFunc(this, this.onTutorialIsShown));
		msgBus.subscribe('tutorialIsHide', new CallbackFunc(this, this.onTutorialIsHide));
		// msgBus.subscribe('changeBackgroundBGIfPortrait', new CallbackFunc(this, this.changeBackgroundBGIfPortrait));
    };

    return BonusHand;
    
});