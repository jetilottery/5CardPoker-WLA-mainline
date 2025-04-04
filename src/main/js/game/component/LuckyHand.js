define([
    'skbJet/component/gladPixiRenderer/gladPixiRenderer',
    'game/component/callbackFunc',
    'game/component/Card',
    'game/component/storePrize',
    'skbJet/component/gameMsgBus/GameMsgBus',
    "skbJet/component/pixiResourceLoader/pixiResourceLoader",
    'game/utils/gameUtils',
    'skbJet/component/SKBeInstant/SKBeInstant'
],function (gr, CallbackFunc, Card, storePrize, msgBus, loader, gameUtils, SKBeInstant) {
    //'use strict';

    // const KeyFrameAnimation = require('skbJet/component/gladPixiRenderer/KeyFrameAnimation');
    // const TweenFunctions = require('game/utils/tweenFunctions');

    function LuckyHand(data){
        this.cards = [];
        this.clickedCardNum = 0;
        this.winType = null;
        this.cardInterval = 0;
        this.isPortrait = false;
        this.hitNumCount = new Array(5);
        this.init(data);
    }

    LuckyHand.prototype.setPockerCard = function(pockerAnim){
        for(let i= 0; i<pockerAnim.length; i++){
            this.cards[i].pockerAnim =pockerAnim[i];
        }        
    };
    LuckyHand.prototype.clone = function(){
        for(let i=2; i<6; i++){
            if(i !== 2){
                gr.animMap._luckyHand_match_2_Anim.clone(["_luckyHand_match_"+i], "_luckyHand_match_"+i+"_Anim");
            }
            gr.animMap["_luckyHand_match_"+i+"_Anim"]._onComplete = function(){
                const hitColor = "FFE234";
                // const hitSize = 24;
                gr.lib['_L_match'+i+'_lable'].updateCurrentStyle({_text:{"_color":hitColor}});
                // gr.lib['_L_match'+i+'_value'].updateCurrentStyle({_font:{_size:hitSize},_text:{"_color":hitColor}});
                gr.lib['_L_match'+i+'_value'].updateCurrentStyle({_text:{"_color":hitColor}});
            };
        }
    };

    LuckyHand.prototype.init = function(data){
        this.clone();
        this.cardInterval = data.cardInterval;

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
        this.reset();
        this.addListeners();
        for(let i=2; i<6; i++){
            if(i !== 2){
                gr.animMap._luckyHand_match_2_Anim.clone(["_luckyHand_match_"+i], "_luckyHand_match_"+i+"_Anim");
            }
            gr.animMap["_luckyHand_match_"+i+"_Anim"]._onComplete = function(){
                const hitColor = "FFE234";
                // const hitSize = 24;
                gr.lib['_L_match'+i+'_lable'].updateCurrentStyle({_text:{"_color":hitColor}});
                // gr.lib['_L_match'+i+'_value'].updateCurrentStyle({_font:{_size:hitSize},_text:{"_color":hitColor}});
                gr.lib['_L_match'+i+'_value'].updateCurrentStyle({_text:{"_color":hitColor}});
            };
        }
    };

    LuckyHand.prototype.playAnim = function(){
        if(!this.winboxError){
            this.playCard(0);
        }

    };
    LuckyHand.prototype.playCard = function(index){
        if(this.winboxError){
            return;
        }
        let _this = this;
        gr.getTimer().setTimeout(function(){
            if(!_this.winboxError){
                gameUtils.playSoundByConfig("CardFlip");
                _this.cards[index].playAnim();        
            }
        },_this.cardInterval);
    };

    LuckyHand.prototype.setHitArray = function(hitRecord){
        this.hitRecord = hitRecord;//{handIndex:[{baseIndex: index, luckyIndex:i}]}
        this.goRecord = {}; //{LuckyIndex:[{handIndex: index, luckyIndex:i}]}
        this.hitNumRecord = {};
        for(let handIndex in hitRecord){
            const handInfo = hitRecord[handIndex];
            if(!this.hitNumRecord[handIndex]){
                this.hitNumRecord[handIndex] = {hitNum:0,target: handInfo.length};
            }
            handInfo.forEach(info => {
                if(!this.goRecord[info.luckyIndex]){
                    this.goRecord[info.luckyIndex] = [];
                }
                this.goRecord[info.luckyIndex].push({"handIndex":handIndex, "baseIndex":info.baseIndex});
            });
        }
    };

    LuckyHand.prototype.recoverPrize = function(index){
        // this.matchAnim.stop();
        gr.animMap["_luckyHand_match_"+index+"_Anim"].stop();
        gr.lib['_luckyHand_match_'+index].updateCurrentStyle({"_transform":{"_scale":{"_x":1,"_y":1}}});
        // let fontsize = gr.lib['_L_match'+index+'_value'].originalFontsize;
        let fontcolor = gr.lib['_L_match'+index+'_value'].originalFontColor;
        // gr.lib['_L_match'+index+'_value'].updateCurrentStyle({_font:{_size:fontsize},_text:{"_color":fontcolor}});
        gr.lib['_L_match'+index+'_value'].updateCurrentStyle({_text:{"_color":fontcolor}});

        // let fontsize = gr.lib['_match'+index+'_lable'].originalFontsize;
        fontcolor = gr.lib['_L_match'+index+'_lable'].originalFontColor;
        gr.lib['_L_match'+index+'_lable'].updateCurrentStyle({_text:{"_color":fontcolor}});

        gr.lib["_multi_"+index].show(false);
    };
    LuckyHand.prototype.oneCardDone = function(card){
        if(this.winboxError){
            return;
        }
        const index = this.clickedCardNum++;
        if (this.clickedCardNum < this.cards.length) {
            this.playCard(this.clickedCardNum);
        }
        if(this.goRecord[index]){
            this.goRecord[index].forEach(cardInfo =>{
                const handIndex = cardInfo.handIndex;
                const baseIndex = cardInfo.baseIndex;
                if(Number(gr.lib['_win'+handIndex]._currentStyle._transform._scale._x) <=0){
                    gameUtils.playSoundByConfig("LuckyHandCardMatch");
                    gr.lib['_hand'+handIndex+ '_'+baseIndex].setImage("gold_"+card.pockerAnim);
                }
                if(this.hitNumRecord[handIndex].target >= 2){
                    const preHitNum = this.hitNumRecord[handIndex].hitNum;
                    if(preHitNum >= 2){
                        if(this.hitNumCount[preHitNum-1]===1){//this hit num just has one
                            this.recoverPrize(preHitNum);
                        } 
                        // storePrize.addTotalWin(storePrize.getLuckyHandWin()[preHitNum]*-1);
                    }
                    if (preHitNum >=1 && this.hitNumCount[preHitNum - 1] >= 1) {
                        this.hitNumCount[preHitNum - 1]--;
                        if(this.hitNumCount[preHitNum - 1] <=1 && preHitNum>=2){
                            gr.lib["_multi_"+preHitNum].show(false);
                        }
                    }
                    const currentHitNum = ++this.hitNumRecord[handIndex].hitNum;
                    this.hitNumCount[currentHitNum-1]++;

                    // gameUtils.playSoundByConfig("LuckyHandCardMatch");
                    // gr.lib['_hand'+handIndex+ '_'+baseIndex].setImage("gold_"+card.pockerAnim);
                    // gr.lib['_luckyHand_'+index].setImage("gold_"+card.pockerAnim);
                    if(currentHitNum >= 2){                        
                        gr.animMap["_luckyHand_match_"+currentHitNum+"_Anim"].play();
                        // msgBus.publish('updateWinValue',storePrize.addTotalWin(storePrize.getLuckyHandWin()[currentHitNum]));
                        if(this.hitNumCount[currentHitNum-1] >=2 && currentHitNum >= 2){
                            gr.lib["_multi_"+currentHitNum].setText(loader.i18n.Game.multi+""+this.hitNumCount[currentHitNum-1]);
                            gr.lib["_multi_"+currentHitNum].show(true);
                        }
                    }
                }
            });
        }       
       
        if(this.clickedCardNum >= this.cards.length){            
            this.allCardsDone();
        }
    };

    LuckyHand.prototype.allCardsDone = function(){
        if(this.winboxError){
            return;
        }
        this.updateWin();
        msgBus.publish('allRevealed');
    };

    LuckyHand.prototype.updateWin = function(){
        // for(let i=0; i<5; i++){            
        //     if(this.goRecord[i]){
        //         this.goRecord[i].forEach(cardInfo =>{
        //             const handIndex = cardInfo.handIndex;
        //             const baseIndex = cardInfo.baseIndex;
        //             if(this.hitNumRecord[handIndex].target === 1){
        //                 gr.lib['_hand'+handIndex+ '_'+baseIndex].setImage("gold_"+card.pockerAnim);//todo set back pocker Image
        //             }
        //         });
        //     }
        // }
        for(let handIndex in this.hitNumRecord){
            const info = this.hitNumRecord[handIndex];
            if(info.target>=2){
                gameUtils.playSoundByConfig("LuckyHandWin");
                gr.lib['_winLucky'+ handIndex].show(false);
                gr.lib['_winPText'+handIndex].setText(loader.i18n.Game.luckyHandWin + SKBeInstant.formatCurrency(storePrize.getLuckyHandWin()[info.target]).formattedAmount);
                gr.lib['_winLText'+handIndex].setText(loader.i18n.Game.luckyHandWin + SKBeInstant.formatCurrency(storePrize.getLuckyHandWin()[info.target]).formattedAmount);
                gr.animMap["_handWinAnim_"+handIndex].play();
                msgBus.publish('updateWinValue',storePrize.addTotalWin(storePrize.getLuckyHandWin()[info.target]));
            }            
        }        
    };

    LuckyHand.prototype.reset = function () {
        this.clickedCardNum = 0;
        this.winboxError = false;
        this.cards.forEach(card => {
            card.reset();
            card.disable();
        });
        for(let i=2; i<6;i++){
            this.recoverPrize(i);
        }
        for(let i = 0; i<5; i++){
            this.hitNumCount[i] = 0;
        }
    };

    LuckyHand.prototype.onWinBoxError = function(){
        this.winboxError = true;
    };

    LuckyHand.prototype.addListeners = function (){
        // msgBus.subscribe('SKBeInstant.gameParametersUpdated', new CallbackFunc(this, this.init));
        // msgBus.subscribe('ticketCostChanged', new CallbackFunc(this, this.reset));
        
		// msgBus.subscribe('jLottery.reInitialize', new CallbackFunc(this, this.onReInitialize));
		// msgBus.subscribe('jLottery.reStartUserInteraction', new CallbackFunc(this, this.onReStartUserInteraction));
		// msgBus.subscribe('jLottery.startUserInteraction', new CallbackFunc(this, this.onStartUserInteraction));
		// msgBus.subscribe('jLottery.enterResultScreenState', new CallbackFunc(this, this.onEnterResultScreenState));
		msgBus.subscribe('winboxError', new CallbackFunc(this, this.onWinBoxError));
		// msgBus.subscribe('jLottery.beginNewGame', new CallbackFunc(this, this.reset));
		// msgBus.subscribe('changeBackgroundBGIfPortrait', new CallbackFunc(this, this.changeBackgroundBGIfPortrait));
    };

    return LuckyHand;
    
});