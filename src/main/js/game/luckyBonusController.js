define([
    'skbJet/component/gladPixiRenderer/gladPixiRenderer',
    'skbJet/component/resourceLoader/resourceLib',
    'skbJet/component/gameMsgBus/GameMsgBus',
    'game/configController',
    'game/component/callbackFunc',
    'game/component/BonusHand',
    "skbJet/component/pixiResourceLoader/pixiResourceLoader",
    'skbJet/component/SKBeInstant/SKBeInstant',
    'skbJet/component/gladPixiRenderer/KeyFrameAnimation',
    'game/utils/tweenFunctions',
    'skbJet/componentCRDC/gladRenderer/gladButton',
    'com/pixijs/pixi',
    'game/utils/gameUtils'
],function(gr, resLib, msgBus, config, CallbackFunc, bonusHand, loader, SKBeInstant, KeyFrameAnimation, TweenFunctions, gladButton, PIXI, gameUtils)  {
    'use strict';
    
    const cardAnimPlaySpeed = 1;
    const suitMap = {
        "Spades": "spade",
        "Hearts": "heart",
        "Diamonds": "diamond",
        "Clubs": "club"
    };

    function LuckyBonus(){
        this.baseToBonusInterval = 500;
        this.bonusToBaseInterval = 1000;
        this.bonusCardInterval = 100;
        this.pickTransAnim = null;
        this.bonusHand = null;
        this.pickSuit = null;
        this.triggerBonusHand = null;
        this.bonusPoker = null;
        // this.revealAll = false;
        this.isPortrait = false;
        this.needPortrait = false;
        this.revealAllButton = null;
        this.pickTransAnimIsPlaying = false;
        this.pickSymbolMoveDone = false;

        this.addListeners();
    }
    const pickerStyle = {
        landscape: { x: 150, y: 150, scaleX: 0.58, scaleY: 0.58, alpha: 1 },
        portrait: { x: 150, y: 150, scaleX: 0.65, scaleY: 0.65, alpha: 1 }
    };

    LuckyBonus.prototype.setSpineData =function(){
        let spineSymbol, style;
        for(let key in suitMap){
            const sp = gr.lib["_"+key];
            if(!sp.spine){
                spineSymbol = new PIXI.spine.Spine(resLib.spine.bonus_Picks.spineData);
                gameUtils.setSpineStype(spineSymbol, pickerStyle[this.isPortrait?"portrait":"landscape"]);
                // style = {x:150, y:150,scaleX:0.58, scaleY:0.58, alpha:1};
                // gameUtils.setSpineStype(spineSymbol, style);
                sp.pixiContainer.addChild(spineSymbol);
                sp.spine = spineSymbol;
            }
        }     
        for(let i=0; i<12; i++){
            const sp = gr.lib["_lucky_pWin_"+i];
            if(!sp.spine){
                spineSymbol = new PIXI.spine.Spine(resLib.spine.luckySuitMatch.spineData);
                style = {x:125, y:125,scaleX:1, scaleY:1};
                gameUtils.setSpineStype(spineSymbol, style);
                sp.pixiContainer.addChild(spineSymbol);
                sp.spine = spineSymbol;
            }
        }   
    };

    LuckyBonus.prototype.init = function(){
        var scaleType = { 'scaleXWhenClick': 0.92, 'scaleYWhenClick': 0.92 };
        this.revealAllButton = new gladButton(gr.lib._bonusPlay, config.gladButtonImgName.buttonBuy, scaleType);
        gameUtils.setButtonHitArea(gr.lib._bonusPlay, config.gladButtonImgName.buttonBuy);
        this.revealAllButton.show(false);
        const isPortrait = SKBeInstant.getGameOrientation() === "landscape"?false:true;

        // If we do not need portrait, set isPortrait to false
        this.isPortrait = this.needPortrait ? isPortrait : false;

        const _this = this;
        this.revealAllButton.click(function(){
            _this.revealAllButton.show(false);
            // _this.revealAllButton.enable(false);
            msgBus.publish("disableButtonInfo");
            gameUtils.playSoundByConfig("ButtonGeneric");
            _this.bonusHand.playAnim();
        });

        gr.lib._pickInfoText.autoFontFitText = true;
        gr.lib._pickInfoText.setText(loader.i18n.Game.pickInfo);

        gr.lib._pickInfoText_P.autoFontFitText = true;
        gr.lib._pickInfoText_P.setText(loader.i18n.Game.pickInfo_P);
        gr.lib._pickInfoText_P.updateCurrentStyle({"_text":{"_lineHeight":25}});
        
        gr.lib._bonusTitle.autoFontFitText = true;
        gr.lib._bonusTitle.setText(loader.i18n.Game.luckySUITS);

        gr.lib._luckyPrize_title.autoFontFitText = true;
        gr.lib._luckyPrize_title.setText(loader.i18n.Game.luckyBonusPrize);

        gr.lib._bonusPlayText.autoFontFitText = true;
        gr.lib._bonusPlayText.setText(loader.i18n.Game.button_autoPlay);
        gameUtils.setTextStyle(gr.lib._bonusPlayText, config.style.buttonTextStyle);

        for(let i=4; i< 13; i++){
            gr.lib['_match'+i+'_lable'].autoFontFitText = true;
            gr.lib['_match'+i+'_lable'].setText(loader.i18n.Game.match+i);
            gr.lib['_match_BG'+i].show(false);

        }

        this.getConfigParameter();
        this.getOriginal();
        
        let cardNames = [];
        for(let i=0; i<12; i++){
            cardNames.push('_lucky_p_'+i);
        }
        this.bonusHand = new bonusHand({
            cardInterval: this.bonusCardInterval,
            bonusToBaseInterval:this.bonusToBaseInterval,
            BGAnim: "cardBackFlip_BonusClubs",
            playAnimSpeed:cardAnimPlaySpeed,
            symbolNames:cardNames,
            revealAllButton:this.revealAllButton
        });
        this.setSpineData();
        this.pickTransitionAnimation();
        this.pickInfoAnimation();
        this.suitInfoAnimation();
        this.setClick4Symbol();
        this.reset();
        gr.lib._luckyInfoText.originalFontSize = gr.lib._luckyInfoText._currentStyle._font._size;
        gr.lib._luckyInfoText_P.originalFontSize = gr.lib._luckyInfoText_P._currentStyle._font._size;

        gr.lib._Spades.pixiContainer.cursor = "pointer";
        gr.lib._Hearts.pixiContainer.cursor = "pointer";
        gr.lib._Clubs.pixiContainer.cursor = "pointer";
        gr.lib._Diamonds.pixiContainer.cursor = "pointer";
        // this.clone();
    };

    // LuckyBonus.prototype.clone = function(){
    //     gr.animMap._pickInfoText_Anim.clone(["_pickInfoText_P"], "_pickInfoText_P_Anim");
    // };

    LuckyBonus.prototype.setHandSuit = function(){
        this.bonusHand.setPickedSuit(this.pickSuit);
        let map = config.gamePocker.bonus[this.pickSuit];
        let animArray = [];
        this.bonusPoker.forEach(pockerNum => {
            for (let i = 0; i < config.gamePocker.bonus.suitStartIndex.length; i++) {
                const suitIndex = config.gamePocker.bonus.suitStartIndex[i];
                if(pockerNum>=suitIndex){
                    animArray.push(config.gamePocker.baseGameRank[pockerNum%13]+map[suitIndex]);
                    break;
                }
            }
        });
        this.bonusHand.setPockerCard(animArray);

        const regE = new RegExp("[\n]", 'g');
        // const suit = loader.i18n.Game["pocker_"+this.pickSuit].toLowerCase();
        this.handleBonusInfo(gr.lib._luckyInfoText, loader.i18n.Game.luckyBonusPickedInfo.split(regE));
        this.handleBonusInfo(gr.lib._luckyInfoText_P, loader.i18n.Game.luckyBonusPickedInfo_P.split(regE));
    };

    LuckyBonus.prototype.setClick4Symbol = function(){
        let _this = this;
        const clickSuitMap = {
            "Spades": "Spades",
            "Hearts": "Hearts",
            "Diamonds": "Diamonds",
            "Clubs": "Clubs"
        };
        
        for(let key in suitMap){
            const sp = gr.lib["_" + key];
            sp.pixiContainer.hitArea = new PIXI.Rectangle(20, 5, 260, 290);
            sp.on("mouseover", function () {
                sp.spine.state.setAnimationByName(0, suitMap[key] + '_Over');
                // console.log(key + ":mouseover");
            });
            sp.on("mouseout", function () {
                // console.log(key + ":mouseout");
                sp.spine.state.setAnimationByName(0, suitMap[key] + '_Idle', true);
            });            
            sp.on('click', function () {
                gameUtils.playSoundByConfig("ChooseSuit");
                _this.pickSuit = clickSuitMap[key];
                _this.suitPicked();
            });
        }
    };

    LuckyBonus.prototype.playClickAnim = function(){
        for(let key in suitMap){
            if(key === this.pickSuit){
                gr.lib["_"+key].spine.state.setAnimationByName(0, suitMap[key]+'_PickLoop', true);
            }else{
                gr.lib["_"+key].spine.state.setAnimationByName(0, suitMap[key]+'_Disable');
            }
        }
    };

    LuckyBonus.prototype.suitPicked = function(){
        this.enablePickSymbol(false);
        this.playClickAnim();
        this.setHandSuit();
        this.pickTransAnim.play();
        this.pickTransAnimIsPlaying = true;

        this.pickInfoAnim.stop();
        this.pickInfoAnim.src = 1;
        this.pickInfoAnim.target = 1.1;
        
        gr.lib._pickInfoText.setText(loader.i18n.Game.pickInfoResult+loader.i18n.Game["pocker_"+this.pickSuit]);
        gr.lib._pickInfoText_P.setText(loader.i18n.Game.pickInfoResult_P+loader.i18n.Game["pocker_"+this.pickSuit]);

        gr.lib._pickInfoText_P.updateCurrentStyle({ "_transform":{"_scale":{"_x":1,"_y":1}}});
        gr.lib._pickInfoText.updateCurrentStyle({ "_transform":{"_scale":{"_x":1,"_y":1}}});
    };

    LuckyBonus.prototype.getOriginal = function(){
        // let orientation = SKBeInstant.getGameOrientation();
        function setOriginal(name){
            let symbol = gr.lib[name];
            symbol.landscape = {};
            symbol.landscape.originalLeft = gr.lib[name+"L"]._currentStyle._left;
            symbol.landscape.originalTop = gr.lib[name+"L"]._currentStyle._top;
            symbol.portrait = {};
            symbol.portrait.originalLeft = gr.lib[name+"P"]._currentStyle._left;
            symbol.portrait.originalTop = gr.lib[name+"P"]._currentStyle._top;
            symbol.originalScale = symbol._currentStyle._transform._scale._x;
            symbol.originalOpacity = symbol._currentStyle._opacity;
        }
        if(!gr.lib._Spades.landscape){
            setOriginal("_Spades");
            setOriginal("_Hearts");
            setOriginal("_Clubs");
            setOriginal("_Diamonds");
        }
        
        function setFontOriginal(symbol){
            symbol.originalFontsize = symbol._currentStyle._font._size;
            symbol.originalFontColor = symbol._currentStyle._text._color;
        }

        for(let index=4; index< 13; index++){
            setFontOriginal(gr.lib['_match'+index+'_lable']);
            setFontOriginal(gr.lib['_match'+index+'_value']);
        }        
    };

    LuckyBonus.prototype.pickInfoAnimation = function (){
		this.pickInfoAnim = new KeyFrameAnimation({
			"_name": 'pickInfoAnim',
			"tweenFunc":  TweenFunctions.linear, //TweenFunctions.easeOutElastic, 
			"_keyFrames": [
				{
					"_time": 0,
					"_SPRITES": []
				},
				{
					"_time": 500,
					"_SPRITES": []
				}
			]
        });
        this.pickInfoAnim.src = 1;
        this.pickInfoAnim.target = 1.1;
		this.pickInfoAnim._onUpdate = new CallbackFunc(this, this.pickInfoOnUpdate);
		this.pickInfoAnim._onComplete = new CallbackFunc(this, this.pickInfoComplete);
    };

    LuckyBonus.prototype.pickInfoOnUpdate =  function({caller:keyFrameAnim, time:timeDelta}){
        const tweenFunc = keyFrameAnim.animData.tweenFunc;
        const duration = keyFrameAnim.maxTime;
        timeDelta = Math.ceil(timeDelta);
        const scale = tweenFunc(timeDelta,this.pickInfoAnim.src, this.pickInfoAnim.target, duration);
        if(this.isPortrait){
            gr.lib._pickInfoText_P.updateCurrentStyle({ "_transform":{"_scale":{"_x":scale,"_y":scale}}});
        }else{
            gr.lib._pickInfoText.updateCurrentStyle({ "_transform":{"_scale":{"_x":scale,"_y":scale}}});
        }       
    };

    LuckyBonus.prototype.pickInfoComplete = function(){
        let temp = this.pickInfoAnim.src;
        this.pickInfoAnim.src = this.pickInfoAnim.target;
        this.pickInfoAnim.target = temp;
        this.pickInfoAnim.play();
    };

    LuckyBonus.prototype.suitInfoAnimation = function (){
		this.suitInfoAnim = new KeyFrameAnimation({
			"_name": 'suitInfoAnim',
			"tweenFunc":  TweenFunctions.linear, //TweenFunctions.easeOutElastic, 
			"_keyFrames": [
				{
					"_time": 0,
					"_SPRITES": []
				},
				{
					"_time": 500,
					"_SPRITES": []
				}
			]
        });
        this.suitInfoAnim.src = 1;
        this.suitInfoAnim.target = 1.1;
		this.suitInfoAnim._onUpdate = new CallbackFunc(this, this.suitInfoOnUpdate);
		this.suitInfoAnim._onComplete = new CallbackFunc(this, this.suitInfoComplete);
    };

    LuckyBonus.prototype.suitInfoOnUpdate =  function({caller:keyFrameAnim, time:timeDelta}){
        const tweenFunc = keyFrameAnim.animData.tweenFunc;
        const duration = keyFrameAnim.maxTime;
        timeDelta = Math.ceil(timeDelta);
        const scale = tweenFunc(timeDelta,this.suitInfoAnim.src, this.suitInfoAnim.target, duration);
        if(this.isPortrait){
            gr.lib._luckyInfoText_P.updateCurrentStyle({ "_transform":{"_scale":{"_x":scale,"_y":scale}}});
        }else{
            gr.lib._luckyInfoText.updateCurrentStyle({ "_transform":{"_scale":{"_x":scale,"_y":scale}}});
        }       
    };

    LuckyBonus.prototype.suitInfoComplete = function(){
        let temp = this.suitInfoAnim.src;
        this.suitInfoAnim.src = this.suitInfoAnim.target;
        this.suitInfoAnim.target = temp;
        this.suitInfoAnim.count--;
        if(this.suitInfoAnim.count >0){
            this.suitInfoAnim.play();
        }
    };    

    LuckyBonus.prototype.pickTransitionAnimation = function (){
		this.pickTransAnim = new KeyFrameAnimation({
			"_name": 'pickTransAnim',
			// "tweenFunc":  TweenFunctions.linear, //TweenFunctions.easeOutElastic, 
			"tweenFunc":  TweenFunctions.easeOutBack, //TweenFunctions.easeOutElastic, 
			"_keyFrames": [
				{
					"_time": 0,
					"_SPRITES": []
				},
				{
					"_time": 1200,
					"_SPRITES": []
				}
			]
        });
        // window.anim = this.pickTransAnim;
		this.pickTransAnim._onUpdate = new CallbackFunc(this, this.picksymbolOnUpdate);
		this.pickTransAnim._onComplete = new CallbackFunc(this, this.pickSymbolOnComplete);
    };
    
    LuckyBonus.prototype.picksymbolOnUpdate = function({caller:keyFrameAnim, time:timeDelta}){
        const tweenFunc = keyFrameAnim.animData.tweenFunc;
        const duration = keyFrameAnim.maxTime;
        timeDelta = Math.ceil(timeDelta);
        const destLeft =  this.isPortrait? 255:570;
        const orientation = this.isPortrait? "portrait":"landscape";
        const destTop =  this.isPortrait? 448:gr.lib["_"+this.pickSuit].landscape.originalTop;
       
        const left = tweenFunc(timeDelta,gr.lib["_"+this.pickSuit][orientation].originalLeft, destLeft, duration);
        const top = tweenFunc(timeDelta,gr.lib["_"+this.pickSuit][orientation].originalTop, destTop, duration);
        // const scale = tweenFunc(timeDelta,gr.lib["_"+this.pickSuit].originalScale, 0.9, duration);
        const opacity = tweenFunc(timeDelta,gr.lib["_"+this.pickSuit].originalOpacity, 0, duration);

        const suits = ["Clubs","Diamonds","Hearts","Spades"];

        suits.forEach(suit => {
            if(suit === this.pickSuit){
                // gr.lib["_"+suit].updateCurrentStyle({"_left":left,"_top":top, "_transform":{"_scale":{"_x":scale,"_y":scale}}});
                gr.lib["_"+suit].updateCurrentStyle({"_left":left,"_top":top});
            }else{
                if(opacity <= gr.lib["_"+suit]._currentStyle._opacity){
                    gr.lib["_"+suit].updateCurrentStyle({"_opacity":opacity});
                }
            }
        });
    };

    LuckyBonus.prototype.handleBonusInfo = function (parentSpr, linesArr) {
        const _this = this;
        const suit = loader.i18n.Game["pocker_"+this.pickSuit].toLowerCase();
        
        var curStyle = parentSpr._currentStyle;
        var fSize = parentSpr.originalFontSize, parentWidth = curStyle._width, parentHeight = curStyle._height, contentWidth = 0, contentHeight;

        var perLineHeight = Math.floor((curStyle._height - (linesArr.length - 1) * 10) / linesArr.length);
        var txtStyle = {fontWeight: curStyle._font._weight, fontFamily: curStyle._font._family, fontSize: fSize, fill: "#"+curStyle._text._color, align: curStyle._text._align, lineHeight: perLineHeight, height: perLineHeight};
        const txtStyleHighLight = {fontWeight: curStyle._font._weight, fontFamily: curStyle._font._family, fontSize: fSize, fill: "#FFE234", align: curStyle._text._align, lineHeight: perLineHeight, height: perLineHeight};
        createLineSpr();
        while (contentWidth > parentWidth || contentHeight > (parentHeight - (linesArr.length - 1) * 10)) {
            fSize--;
            txtStyle.fontSize = fSize;
            createLineSpr();
        }
        setPosition();
      
        function createLineSpr() {
            let height;
            function createTxt(content, style,container = parentSpr.pixiContainer) {
                let txtSpr = new PIXI.Text(content, style);
                container.addChild(txtSpr);
                contentWidth += txtSpr.width;
                height = txtSpr.height;
            }
            parentSpr.pixiContainer.removeChildren();
            contentHeight = 0;
            contentWidth = 0;
            for (var i = 0; i < linesArr.length; i++) {
                const index = linesArr[i].indexOf("{suit}");
                if(index>0){
                    const container = new PIXI.Container();
                    createTxt(linesArr[i].slice(0, index),txtStyle,container);
                    createTxt(suit, txtStyleHighLight,container);
                    createTxt(linesArr[i].slice(index+ "{suit}".length),txtStyle,container);
                    parentSpr.pixiContainer.addChild(container);
                }else{
                    createTxt(linesArr[i],txtStyle);
                }
                contentHeight += height;
            }
        }
        function setPosition() {
            var line, prevLine, prevSpr;
            for (var i = 0; i < parentSpr.pixiContainer.children.length; i++) {
                line = parentSpr.pixiContainer.children[i];
                line.cttWidth = 0;
                if (line.children.length === 0) {
                    line.x = (parentWidth - line.width) / 2;
                } else {
                    for (var j = 0; j < line.children.length; j++) {
                        var subSpr = line.children[j];
                        if (j === 0) {
                            subSpr.x = 0;
                        } else {
                            prevSpr = line.children[j - 1];
                            subSpr.x = prevSpr.x + prevSpr.width;
                        }
                        line.cttHeight = subSpr.height;
                        line.cttWidth += subSpr.width;
                        subSpr.y = (line.cttHeight - subSpr.height) / 2;
                    }
                    line.x = (parentWidth - line.cttWidth) / 2;
                }
                if (i === 0) {
                    line.y = (parentHeight - contentHeight - (linesArr.length - 1) * 10) / 2;
                } else {
                    prevLine = parentSpr.pixiContainer.children[i - 1];
                    if (_this.isPortrait) {
                        line.y = prevLine.y + prevLine.height;
                    } else {
                        line.y = prevLine.y + prevLine.height + 10;
                    }
                }
            }
        }
        
    };

    LuckyBonus.prototype.pickSymbolOnComplete = function(){
        const _this = this;
        this.pickSymbolMoveDone = true;
        gr.lib._pickedBG.show(true);
        this.revealAllButton.enable(false);
        this.revealAllButton.show(SKBeInstant.config.autoRevealEnabled);

        gr.getTimer().setTimeout(function(){
            gr.animMap._pickToBonus._onComplete = function(){
                _this.pickTransAnimIsPlaying = false;
                _this.pickSymbolMoveDone = false;
                gr.lib._buttonPlay.show(false);
                _this.bonusHand.enable();
                _this.suitInfoAnim.count=4;
                _this.suitInfoAnim.play();
                _this.revealAllButton.enable(true);
                msgBus.publish("enableButtonInfo");
            };
            gr.animMap._pickToBonus.play();
            msgBus.publish("endPicker");
        },1500);
    };

    LuckyBonus.prototype.resetPickSymbols = function(){
        const orientation = this.isPortrait ? "portrait":"landscape";
        function resetPickSymbol(symbol){
            if(symbol[orientation]){
                symbol.updateCurrentStyle({_left:symbol[orientation].originalLeft,_top:symbol[orientation].originalTop,_transform:{_scale:{_x:symbol.originalScale,_y:symbol.originalScale}}, _opacity:symbol.originalOpacity});
            }
        }
        resetPickSymbol(gr.lib._Spades);
        resetPickSymbol(gr.lib._Hearts);
        resetPickSymbol(gr.lib._Clubs);
        resetPickSymbol(gr.lib._Diamonds);
    };

    LuckyBonus.prototype.reset = function(){
        this.bonusHand.reset();
        gr.lib._pickInfoText.setText(loader.i18n.Game.pickInfo);
        gr.lib._pickInfoText_P.setText(loader.i18n.Game.pickInfo_P);

        gr.lib._pickedBG.show(false);
        gr.lib._luckyBonusGame.updateCurrentStyle({"_opacity":0});
        gr.lib._luckyBonus.updateCurrentStyle({"_opacity":0});
        gr.lib._pick.updateCurrentStyle({"_opacity":1});
        
        this.resetPickSymbols();
        this.revealAllButton.show(false);
        this.revealAllButton.enable(false);
        
        this.triggerBonusHand = null;
        this.bonusPoker = null;
        // this.revealAll = false;
        gr.lib._transitionContainer.show(false);
        gr.lib._transitionContainer_P.show(false);
        this.enablePickSymbol(false);

    };
    LuckyBonus.prototype.getConfigParameter = function(){
        if (SKBeInstant.config.customBehavior) {            
            if (SKBeInstant.config.customBehavior.hasOwnProperty('baseToBonusInterval')) {
                this.baseToBonusInterval = Number(SKBeInstant.config.customBehavior.baseToBonusInterval);
            }
            if (SKBeInstant.config.customBehavior.hasOwnProperty('bonusToBaseInterval')) {
                this.bonusToBaseInterval = Number(SKBeInstant.config.customBehavior.bonusToBaseInterval);
            }
            if (SKBeInstant.config.customBehavior.hasOwnProperty('bonusCardInterval')) {
                this.bonusCardInterval = Number(SKBeInstant.config.customBehavior.bonusCardInterval);
            }
        } else if (loader.i18n.gameConfig) {
            if (loader.i18n.gameConfig.hasOwnProperty('baseToBonusInterval')) {
                this.baseToBonusInterval = Number(loader.i18n.gameConfig.baseToBonusInterval);
            }
            if (loader.i18n.gameConfig.hasOwnProperty('bonusToBaseInterval')) {
                this.bonusToBaseInterval = Number(loader.i18n.gameConfig.bonusToBaseInterval);
            }
            if (loader.i18n.gameConfig.hasOwnProperty('bonusCardInterval')) {
                this.bonusCardInterval = Number(loader.i18n.gameConfig.bonusCardInterval);
            }
        }
    };

    LuckyBonus.prototype.onStartUserInteraction = function(data){
        //data.scenario = "42,26,30,13,41|39,52,36,45,10|17,32,50,24,47|49,28,51,43,18|22,20,35,48,44|31,6,19,21,4|25,21,6,4,29|4|29,9,10,47,4,38,12,41,14,32,52,2";        
        const scenario = data.scenario;
        const parts = scenario.split("|");
        this.triggerBonusHand = Number(parts[7])-1;
        this.bonusPoker = parts[8].split(",");

    };

    LuckyBonus.prototype.enablePickSymbol = function(flag){
        gr.lib._Spades.pixiContainer.interactive = flag;
        gr.lib._Hearts.pixiContainer.interactive = flag;
        gr.lib._Clubs.pixiContainer.interactive = flag;
        gr.lib._Diamonds.pixiContainer.interactive = flag;
    };

    LuckyBonus.prototype.startLuckyBonusPicker = function(){
        if(this.winBoxError){
            return;
        }
        const _this = this;
        gr.animMap._baseToBonus._onComplete = function(){
            if(this.winBoxError){
                return;
            }
            _this.enablePickSymbol(true);
            _this.pickInfoAnim.play();
        };
        this.bonusHand.disable();
        this.revealAllButton.enable(false);

        gr.getTimer().setTimeout(function(){
            if(this.winBoxError){
                return;
            } 
            gameUtils.playSoundByConfig("Transition");            
            gr.animMap._baseToBonus.play();
            msgBus.publish("startPicker");
             for(let key in suitMap){
                 gr.lib["_"+key].spine.state.setAnimationByName(0, suitMap[key]+'_Idle',true);                
             }
    
            if(_this.isPortrait){
                gameUtils.resetSpine(gr.lib._transitionContainer_P.spine);
                gr.lib._transitionContainer_P.show(true);
                gr.lib._transitionContainer_P.spine.state.setAnimation(0, 'portrait_Transition').listener={
                    complete:function(){
                        gr.lib._transitionContainer_P.show(false);
                    }
                };
            }else{
                gameUtils.resetSpine(gr.lib._transitionContainer.spine);
                gr.lib._transitionContainer.show(true);
                gr.lib._transitionContainer.spine.state.setAnimation(0, 'landscape_Transition').listener={
                    complete:function(){
                        gr.lib._transitionContainer.show(false);
                    }
                };
            }
        }, this.baseToBonusInterval);
        
    };

    LuckyBonus.prototype.onBeginNewGame = function(){
        this.reset();
        gr.animMap._pickToBonus.updateStyleToTime(0);
    };

    LuckyBonus.prototype.onOrientChange = function(isPortrait){
        // If we do not need portrait, set isPortrait to false
        this.isPortrait = this.needPortrait ? isPortrait : false;

        if(this.pickTransAnimIsPlaying){
            if(this.pickSymbolMoveDone){ //anim is done, still show picked symbol, so 
                const destLeft =  isPortrait? 255:570;
                const destTop =  isPortrait? 448:gr.lib["_"+this.pickSuit].landscape.originalTop;
                gr.lib["_"+this.pickSuit].updateCurrentStyle({"_left":destLeft,"_top":destTop});
            }
        }else{
            this.resetPickSymbols();
        }
    };

    LuckyBonus.prototype.backToBaseDone = function(){        
        this.suitInfoAnim.stop();
        this.suitInfoAnim.src = 1;
        this.suitInfoAnim.target = 1.1;
        gr.lib._luckyInfoText_P.updateCurrentStyle({ "_transform":{"_scale":{"_x":1,"_y":1}}});
        gr.lib._luckyInfoText.updateCurrentStyle({ "_transform":{"_scale":{"_x":1,"_y":1}}});
    };

    LuckyBonus.prototype.onWinBoxError = function(){
        this.revealAllButton.enable(false);
        this.winBoxError = true;
    };

    LuckyBonus.prototype.onTutorialIsShown = function(){
        this.revealAllButton.enable(false);
    };
    LuckyBonus.prototype.onTutorialIsHide = function(){
        if(!this.bonusHand.allCardsClicked){
            this.revealAllButton.enable(true);
        }
    };

    LuckyBonus.prototype.updatePortraitNeeded = function(portraitIsNeeded){
        // FIVECARD-253 - Bonus screen shows in landscape mode when in portrait on mobile and tablet
        // Store this.needPortrait as portraitIsNeeded
        this.needPortrait = portraitIsNeeded;
        // Then update isPortrait as required
        const isPortrait = SKBeInstant.getGameOrientation() === "landscape"?false:true;
        // If we do not need portrait, set isPortrait to false
        this.isPortrait = this.needPortrait ? isPortrait : false;
    };

     LuckyBonus.prototype.addListeners = function (){
        msgBus.subscribe('SKBeInstant.gameParametersUpdated', new CallbackFunc(this, this.init));
        // msgBus.subscribe('ticketCostChanged', new CallbackFunc(this, this.onTicketCostChanged));
     
        
        // msgBus.subscribe('changeBackgroundBGIfPortrait', new CallbackFunc(this, this.changeBackgroundBGIfPortrait));
        
		// msgBus.subscribe('jLottery.reInitialize', new CallbackFunc(this, this.onReInitialize));
		msgBus.subscribe('jLottery.reStartUserInteraction', new CallbackFunc(this, this.onStartUserInteraction));
		msgBus.subscribe('jLottery.startUserInteraction', new CallbackFunc(this, this.onStartUserInteraction));
        // msgBus.subscribe('startRevealAll', new CallbackFunc(this, this.startRevealAll));
        msgBus.subscribe("startLuckyBonusPicker",new CallbackFunc(this, this.startLuckyBonusPicker));
		// msgBus.subscribe('jLottery.enterResultScreenState', new CallbackFunc(this, this.onEnterResultScreenState));
		msgBus.subscribe('winboxError', new CallbackFunc(this, this.onWinBoxError));
        msgBus.subscribe('jLottery.beginNewGame', new CallbackFunc(this, this.onBeginNewGame));
        msgBus.subscribe('changeBackgroundBGIfPortrait', new CallbackFunc(this, this.onOrientChange));
        msgBus.subscribe('backToBaseDone', new CallbackFunc(this, this.backToBaseDone));
        msgBus.subscribe("tutorialIsShown", new CallbackFunc(this, this.onTutorialIsShown));
        msgBus.subscribe("tutorialIsHide", new CallbackFunc(this, this.onTutorialIsHide));
        msgBus.subscribe('updatePortraitNeeded', new CallbackFunc(this, this.updatePortraitNeeded));
    };
    return LuckyBonus;
});