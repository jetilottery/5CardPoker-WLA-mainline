define([
    'skbJet/component/gameMsgBus/GameMsgBus',
    'skbJet/component/howlerAudioPlayer/howlerAudioSpritePlayer',
    'skbJet/component/gladPixiRenderer/gladPixiRenderer',
    'skbJet/component/pixiResourceLoader/pixiResourceLoader',
    'skbJet/component/SKBeInstant/SKBeInstant',
    'skbJet/componentCRDC/gladRenderer/gladButton',
    'game/utils/gameUtils',
    'game/configController',
    "game/component/Hand",
    'skbJet/component/resourceLoader/resourceLib',
    'com/pixijs/pixi'
], function(msgBus, audio, gr, loader, SKBeInstant, gladButton, gameUtils, config, Hand, resLib, PIXI) {
    let revealAllButton, showPrizeButton, hidePrizeButton;
    const cardAnimPlaySpeed = 1;
    let Hands = [];
    let revealCardInterval = 50;
    let revealHandInterval = 100;
    let triggerBonusHand = null;
    let luckyBonusTriggered = false;
    let luckyBonusEnd = false;
    let allHandsDone = false;
    let winboxError = false;
    let revealAllTriggered = false;
    let showTutorialAtBeginning = false;
    //   let winResult;
    let timerTag = null;
    let inGame = false;
    const idleArray = [0, 1, 2, 3, 4, 5];
    let hasTryOrBuy = false;

    let prizeMap = {
        "A": "_RoyalFlush",
        "B": "_straightFlush",
        "C": "_4ofAKind",
        "D": "_fullHouse",
        "E": "_flush",
        "F": "_straight",
        "G": "_3ofAKind",
        "H": "_2Pairs"
    };

    function setSpineData() {
        let spineSymbol, style;
        for (let i = 0; i < 6; i++) {
            let sp = gr.lib["_winLuckyAnim" + i];
            if (!sp.spine) {
                spineSymbol = new PIXI.spine.Spine(resLib.spine.chipAnims.spineData);
                style = { x: 200, y: 200, scaleX: 0.8, scaleY: 0.8 };
                gameUtils.setSpineStype(spineSymbol, style);
                sp.pixiContainer.addChild(spineSymbol);
                sp.spine = spineSymbol;
            }
            sp = gr.lib["_winBG" + i];
            if (!sp.spine) {
                spineSymbol = new PIXI.spine.Spine(resLib.spine.winningHandEffect.spineData);
                style = { x: 250, y: 100, scaleX: 1, scaleY: 1 };
                gameUtils.setSpineStype(spineSymbol, style);
                sp.pixiContainer.addChild(spineSymbol);
                sp.spine = spineSymbol;
            }
        }
    }

    function onGameParametersUpdated() {
        gameUtils.setButtonHitArea(gr.lib._buttonAudioOn, config.gladButtonImgName.buttonAudioOn);
        gameUtils.setButtonHitArea(gr.lib._buttonAudioOff, config.gladButtonImgName.buttonAudioOff);

        var scaleType = { 'scaleXWhenClick': 0.92, 'scaleYWhenClick': 0.92 };
        revealAllButton = new gladButton(gr.lib._buttonPlay, config.gladButtonImgName.buttonBuy, scaleType);
        gameUtils.setButtonHitArea(gr.lib._buttonPlay, config.gladButtonImgName.buttonBuy);

        showPrizeButton = new gladButton(gr.lib._prizeButton, "prizeHandButton", scaleType);
        gameUtils.setButtonHitArea(gr.lib._prizeButton, "prizeHandButton");

        hidePrizeButton = new gladButton(gr.lib._hidePrizeButton, "prizeHandButton", scaleType);
        gameUtils.setButtonHitArea(gr.lib._hidePrizeButton, "prizeHandButton");

        gameUtils.setTextStyle(gr.lib._playText, config.style.buttonTextStyle);

        revealAllButton.click(startRevealAll);
        gr.lib._buttonPlay.show(false);


        if (SKBeInstant.config.gameType === 'ticketReady') {
            onBuyTicket();
        }

        getConfigParameter();
        initPrizeTable();
        initHand();
        initInfo();
        setSpineData();
    }

    function getConfigParameter() {
        if (SKBeInstant.config.customBehavior) {
            if (SKBeInstant.config.customBehavior.hasOwnProperty('revealCardInterval')) {
                revealCardInterval = Number(SKBeInstant.config.customBehavior.revealCardInterval);
            }
            if (SKBeInstant.config.customBehavior.hasOwnProperty('revealHandInterval')) {
                revealHandInterval = Number(SKBeInstant.config.customBehavior.revealHandInterval);
            }
        } else if (loader.i18n.gameConfig) {
            if (loader.i18n.gameConfig.hasOwnProperty('revealCardInterval')) {
                revealCardInterval = Number(loader.i18n.gameConfig.revealCardInterval);
            }
            if (loader.i18n.gameConfig.hasOwnProperty('revealHandInterval')) {
                revealHandInterval = Number(loader.i18n.gameConfig.revealHandInterval);
            }
        }
    }

    function initInfo() {
        gr.lib._luckyBonusInfoText.autoFontFitText = true;
        gr.lib._luckyBonusInfoText.setText(loader.i18n.Game.luckyBonusInfo);

        gr.lib._luckyHandInfoText.autoFontFitText = true;
        gr.lib._luckyHandInfoText.setText(loader.i18n.Game.luckyHandInfo);

        gr.lib._luckyHandLucky_txt.autoFontFitText = true;
        gr.lib._luckyHandLucky_txt.setText(loader.i18n.Game.lucky);
        // gr.lib._luckyHandLucky_txt.setText("HHHHHH");

        gr.lib._yourHandText.autoFontFitText = true;
        gameUtils.setTextStyle(gr.lib._yourHandText, config.style.whiteTextStyle);
        gr.lib._yourHandText.setText(loader.i18n.Game.your_hands);

        gr.lib._yourHandText_P.autoFontFitText = true;
        gameUtils.setTextStyle(gr.lib._yourHandText_P, config.style.whiteTextStyle);
        gr.lib._yourHandText_P.setText(loader.i18n.Game.your_hands);

        gr.lib._howToWinText.autoFontFitText = true;
        gameUtils.setTextStyle(gr.lib._howToWinText, config.style.whiteTextStyle);
        gr.lib._howToWinText.setText(loader.i18n.Game.yourHandsInfo);

        gr.lib._howToWinText_P.autoFontFitText = true;
        gameUtils.setTextStyle(gr.lib._howToWinText_P, config.style.whiteTextStyle);
        gr.lib._howToWinText_P.setText(loader.i18n.Game.yourHandsInfo_P);

        for (let i = 0; i < 6; i++) {
            gr.lib["_winLText" + i].autoFontFitText = true;
            gr.lib["_winPText" + i].autoFontFitText = true;
        }
    }

    function initHand() {
        for (let i = 0; i < 6; i++) {
            let cardsName = [];
            for (let j = 0; j < 5; j++) {
                cardsName.push('_hand' + i + '_' + j);
            }
            Hands.push(new Hand({
                handNum: i,
                BGAnim: "cardBackFlip_YourHand",
                playAnimSpeed: cardAnimPlaySpeed,
                symbolNames: cardsName,
                cardInterval: revealCardInterval
            }));
            gameUtils.addReverseAnim("cardBackFlip_YourHand");
            gameUtils.setTextStyle(gr.lib['_winLucyText' + i], config.style.yellowTextStyle);
            gr.lib['_winLucyText' + i].setText(loader.i18n.Game.luckyBonus);
        }
    }

    function initPrizeTable() {
        gameUtils.setTextStyle(gr.lib._prizeButtonText, config.style.buttonTextStyle);
        gameUtils.setTextStyle(gr.lib._hidePrizeText, config.style.buttonTextStyle);

        function HidePrizeTable() {
            if (gr.lib._tutorial.pixiContainer.visible) {
                return;
            }
            gr.lib._prizeTable.show(false);
            showPrizeButton.enable(true);
            gameUtils.playSoundByConfig("ButtonGeneric");
            if (!allHandsDone && hasTryOrBuy) {
                enableRevealAllButton();
                //msgBus.publish("enableButtonInfo");
            }
        }
        showPrizeButton.click(function() {
            showPrizeButton.enable(false);
            gameUtils.playSoundByConfig("ButtonGeneric");
            if (!allHandsDone) {
                disableRevealAllButton();
                //msgBus.publish("disableButtonInfo");
            }
            gr.lib._prizeTable.show(true);
        });

        gr.lib._prizeTableBG.on('click', HidePrizeTable);
        gr.lib._prizeTableBG_P.on('click', HidePrizeTable);

        hidePrizeButton.click(HidePrizeTable);

        // FIVECARD-238 -LNB - nl_be fr_be - Text to small to be read on winning hands screen
        // gr.lib._disclaimer._currentStyle._width = gr.lib._disclaimer._currentStyle._width*2.5;

        gameUtils.setTextStyle(gr.lib._disclaimer, config.style.whiteTextStyle);
        gr.lib._disclaimer.setText(loader.i18n.Game.Disclaimer);

        gr.lib._prizeTableInfo.autoFontFitText = true;
        gameUtils.setTextStyle(gr.lib._prizeTableInfo, config.style.whiteTextStyle);
        gr.lib._prizeTableInfo.setText(loader.i18n.Game.prizeTableInfo);

        gr.lib._prizeTableInfo_P.autoFontFitText = true;
        gameUtils.setTextStyle(gr.lib._prizeTableInfo_P, config.style.whiteTextStyle);
        gr.lib._prizeTableInfo_P.setText(loader.i18n.Game.prizeTableInfo_P);

        gr.lib._playText.autoFontFitText = true;
        gr.lib._playText.setText(loader.i18n.Game.button_autoPlay);

        gr.lib._prizeButtonText.autoFontFitText = true;
        gr.lib._prizeButtonText.setText(loader.i18n.Game.show_button_prize);

        gr.lib._hidePrizeText.autoFontFitText = true;
        gr.lib._hidePrizeText.setText(loader.i18n.Game.hide_button_prize);

        gr.lib._prizeTable.show(false);

        gr.lib._RoyalFlush_label.autoFontFitText = true;
        gameUtils.setTextStyle(gr.lib._RoyalFlush_label, config.style.whiteTextStyle);
        gr.lib._RoyalFlush_win.autoFontFitText = true;
        gameUtils.setTextStyle(gr.lib._RoyalFlush_win, config.style.yellowTextStyle);
        gr.lib._RoyalFlush_label.setText(loader.i18n.Game.pocker_A);

        gr.lib._straightFlush_label.autoFontFitText = true;
        gameUtils.setTextStyle(gr.lib._straightFlush_label, config.style.whiteTextStyle);
        gr.lib._straightFlush_win.autoFontFitText = true;
        gameUtils.setTextStyle(gr.lib._straightFlush_win, config.style.yellowTextStyle);
        gr.lib._straightFlush_label.setText(loader.i18n.Game.pocker_B);

        gr.lib._4ofAKind_label.autoFontFitText = true;
        gameUtils.setTextStyle(gr.lib._4ofAKind_label, config.style.whiteTextStyle);
        gr.lib._4ofAKind_win.autoFontFitText = true;
        gameUtils.setTextStyle(gr.lib._4ofAKind_win, config.style.yellowTextStyle);
        gr.lib._4ofAKind_label.setText(loader.i18n.Game.pocker_C);

        gr.lib._fullHouse_label.autoFontFitText = true;
        gameUtils.setTextStyle(gr.lib._fullHouse_label, config.style.whiteTextStyle);
        gr.lib._fullHouse_win.autoFontFitText = true;
        gameUtils.setTextStyle(gr.lib._fullHouse_win, config.style.yellowTextStyle);
        gr.lib._fullHouse_label.setText(loader.i18n.Game.pocker_D);

        gr.lib._flush_label.autoFontFitText = true;
        gameUtils.setTextStyle(gr.lib._flush_label, config.style.whiteTextStyle);
        gr.lib._flush_win.autoFontFitText = true;
        gameUtils.setTextStyle(gr.lib._flush_win, config.style.yellowTextStyle);
        gr.lib._flush_label.setText(loader.i18n.Game.pocker_E);

        gr.lib._straight_label.autoFontFitText = true;
        gameUtils.setTextStyle(gr.lib._straight_label, config.style.whiteTextStyle);
        gr.lib._straight_win.autoFontFitText = true;
        gameUtils.setTextStyle(gr.lib._straight_win, config.style.yellowTextStyle);
        gr.lib._straight_label.setText(loader.i18n.Game.pocker_F);

        gr.lib._3ofAKind_label.autoFontFitText = true;
        gameUtils.setTextStyle(gr.lib._3ofAKind_label, config.style.whiteTextStyle);
        gr.lib._3ofAKind_win.autoFontFitText = true;
        gameUtils.setTextStyle(gr.lib._3ofAKind_win, config.style.yellowTextStyle);
        gr.lib._3ofAKind_label.setText(loader.i18n.Game.pocker_G);

        gr.lib._2Pairs_label.autoFontFitText = true;
        gameUtils.setTextStyle(gr.lib._2Pairs_label, config.style.whiteTextStyle);
        gr.lib._2Pairs_win.autoFontFitText = true;
        gameUtils.setTextStyle(gr.lib._2Pairs_win, config.style.yellowTextStyle);
        gr.lib._2Pairs_label.setText(loader.i18n.Game.pocker_H);

    }

    function startRevealAll() {
        // disableRevealAllButton();
        revealAllButton.show(false);
        showPrizeButton.enable(false);
        revealAllTriggered = true;
        gameUtils.playSoundByConfig("ButtonGeneric");
        stopIdle();
        let i = 0;
        Hands.forEach(hand => {
            if (!hand.revealed) {
                hand.disable();
                gr.getTimer().setTimeout(function() {
                    if (winboxError) {
                        return;
                    }
                    hand.playAnim();
                }, i++ * revealHandInterval);
            }
        });
        msgBus.publish("disableButtonInfo");
        msgBus.publish("startRevealAll");
    }

    function onTicketCostChanged(prizePoint) {
        let rc = SKBeInstant.config.gameConfigurationDetails.revealConfigurations;
        for (let i = 0; i < rc.length; i++) {
            if (Number(prizePoint) === Number(rc[i].price)) {
                let pt = rc[i].prizeTable;
                pt.forEach(element => {
                    let des = element.description;
                    const value = SKBeInstant.formatCurrency(Number(element.prize)).formattedAmount;
                    if (/B\d/.test(des)) {
                        const index = des.substring(1);
                        gr.lib['_match' + index + '_value'].autoFontFitText = true;
                        gr.lib['_match' + index + '_value'].setText(value);
                    } else if (/^[A-H]/.test(des)) {
                        const index = des.charAt(0);
                        gr.lib[prizeMap[index] + "_win"].setText(value);
                    } else if (/L[5432]/.test(des)) {
                        const index = des.substring(1);
                        gr.lib['_L_match' + index + '_value'].autoFontFitText = true;
                        gr.lib['_L_match' + index + '_value'].setText(value);
                    }
                });
            }
        }
    }

    function onBuyTicket() {
        gr.lib._howToWin.show(false);
        hasTryOrBuy = true;
    }

    function onStartUserInteraction(data) {
        inGame = true;
        // gameUtils.playSoundByConfig("baseGameLoop",true);
        audio.volume(0, 0.5);
        gr.lib._howToWin.show(false);
        //data.scenario = "42,26,30,13,41|39,52,36,45,10|17,32,50,24,47|49,28,51,43,18|22,20,35,48,44|31,6,19,21,4|25,21,6,4,29|4|29,9,10,47,4,38,12,41,14,32,52,2";
        luckyBonusTriggered = false;
        luckyBonusEnd = false;
        allHandsDone = false;
        addIdle();
        revealAllTriggered = false;
        gr.lib._buttonPlay.show(SKBeInstant.config.autoRevealEnabled);
        if (gr.lib._prizeTable.pixiContainer.visible || (SKBeInstant.config.gameType === 'ticketReady' && showTutorialAtBeginning)) {
            disableRevealAllButton();
        } else {
            enableRevealAllButton();
        }
        const scenario = data.scenario;
        const parts = scenario.split("|");
        // winResult = data.winResult;
        analyzeBase(parts);

        // if(revealAllButton.getEnabled()){
        //     Hands.forEach(hand => {hand.enable();});
        // }

        triggerBonusHand = Number(parts[7]) - 1;
        if (triggerBonusHand > -1) {
            Hands[triggerBonusHand].setTriggerBonus();
        }
    }

    function checkHandType(hand, pokerAnim) {
        let suits = [0, 0, 0, 0];
        let ranks = {};
        // let anim = [];
        let flush = false;
        let fourOfKind = false;
        let threeOfKind = false;
        let straight = false;
        let min = 13;
        let max = -1;
        let sum = 0;
        hand.forEach(pokerNum => {
            const rankIndex = pokerNum % 13;
            if (rankIndex === 0) {
                max = 13;
                sum += 13;
            } else {
                if (rankIndex > max) {
                    max = rankIndex;
                }
                if (rankIndex < min) {
                    min = rankIndex;
                }
                sum += rankIndex;
            }

            const suitIndex = pokerNum % 13 === 0 ? Math.floor(pokerNum / 13) - 1 : Math.floor(pokerNum / 13);

            suits[suitIndex]++;
            if (suits[suitIndex] === 5) { //flush
                flush = true;
            }
            if (ranks[rankIndex]) {
                ranks[rankIndex]++;
                if (ranks[rankIndex] === 4) {
                    fourOfKind = true;
                    threeOfKind = false;
                } else if (ranks[rankIndex] === 3) {
                    threeOfKind = true;
                }
            } else {
                ranks[rankIndex] = 1;
            }

            pokerAnim.push(config.gamePocker.baseGameRank[rankIndex] + config.gamePocker.baseGameSuits[suitIndex]);
        });

        if (fourOfKind) {
            return "C";
        }
        let pairs = 0;
        Object.keys(ranks).forEach(key => {
            if (ranks[key] === 2) {
                pairs++;
            }
        });

        if (pairs === 2) {
            return "H"; //two pairs
        }

        if (threeOfKind) {
            if (pairs === 1) {
                return "D"; // full house
            }
            return "G";
        }
        if ((max - min === 4) && ((max + min) * 5 / 2 === sum)) { //straight
            straight = true;
        }
        if (ranks[10] && ranks[11] && ranks[12] && ranks[0] & ranks[1]) { //10,J,Q,K,A
            straight = true;
            if (flush) {
                return "A";
            }
        }

        if (flush && straight) {
            return "B";
        } else if (flush) {
            return "E";
        } else if (straight) {
            return "F";
        }

        return null;
    }

    function analyzeBase(parts) {
        for (let i = 0; i < 6; i++) {
            const hand = parts[i];
            let animArray = [];
            const winType = checkHandType(hand.split(","), animArray);
            if (winType) {
                gr.lib["_winLText" + i].setText(loader.i18n.Game["pocker_" + [winType]] + loader.i18n.Game.prizeContact + gr.lib[prizeMap[winType] + "_win"]._currentStyle._text._token);
                gr.lib["_winPText" + i].setText(loader.i18n.Game["pocker_" + [winType]] + loader.i18n.Game.prizeContact + gr.lib[prizeMap[winType] + "_win"]._currentStyle._text._token);
            }
            Hands[i].setPockerCard(animArray);
            animArray.forEach(animName => {
                gameUtils.addReverseAnim(animName);
            });
            Hands[i].setWinType(winType);
        }
    }

    function onHandStartReveal(handNum) {
        if (Hands.every(hand => { return hand.revealed; })) {
            // disableRevealAllButton();
            revealAllButton.show(false);
            showPrizeButton.enable(false);
            msgBus.publish("disableButtonInfo");
        }
        if (handNum === triggerBonusHand) {
            disableRevealAllButton();
            showPrizeButton.enable(false);
            msgBus.publish("disableButtonInfo");
            Hands.forEach(hand => hand.disable());
        }
    }

    function onWinBoxError() {
        winboxError = true;
        Hands.forEach(hand => {
            if (!hand.revealed) {
                hand.disable();
            }
        });
    }

    function stopIdle() {
        if (timerTag) {
            gr.getTimer().clearTimeout(timerTag);
            timerTag = null;
        }
    }

    function addIdle() {
        if (allHandsDone) {
            return;
        }
        stopIdle();
        gameUtils.randomSort(idleArray);
        let index = 0;
        const base = 6;
        triggerIdle();

        function triggerIdle() {
            let count = 0;
            let interval;
            if (timerTag) {
                interval = Math.ceil(Math.random() * base);
            } else {
                interval = base;
            }
            while (Hands[idleArray[index]].revealed && count < 6) {
                index = (index + 1) % 6;
                count++;
            }
            if (!Hands[idleArray[index]].revealed) {
                timerTag = gr.getTimer().setTimeout(function() {
                    gr.animMap["_idle" + idleArray[index]]._onComplete = function() {
                        if (timerTag) {
                            index = (index + 1) % 6;
                            triggerIdle();
                        }
                    };
                    gr.animMap["_idle" + idleArray[index]].play();
                }, interval * 1000);
            }
        }


    }

    function enableRevealAllButton() {
        revealAllButton.enable(true);
        Hands.forEach(hand => { hand.revealed === false && hand.enable(); });
    }

    function disableRevealAllButton() {
        Hands.forEach(hand => { hand.disable(); });
        revealAllButton.enable(false);
    }

    msgBus.subscribe('SKBeInstant.gameParametersUpdated', onGameParametersUpdated);
    msgBus.subscribe('ticketCostChanged', onTicketCostChanged);
    msgBus.subscribe('buyOrTryHaveClicked', onBuyTicket);
    msgBus.subscribe('jLottery.reStartUserInteraction', onStartUserInteraction);
    msgBus.subscribe('jLottery.startUserInteraction', onStartUserInteraction);
    msgBus.subscribe("handStartReveal", onHandStartReveal);
    msgBus.subscribe("startLuckyBonusPicker", function() {
        luckyBonusTriggered = true;
        disableRevealAllButton();
        showPrizeButton.enable(false);
    });
    msgBus.subscribe("oneHandDone", function() {
        allHandsDone = Hands.reduce(function(preResult, hand) {
            return preResult & hand.cardsDone;
        }, true);
        if (allHandsDone) {
            // disableRevealAllButton();
            revealAllButton.show(false);
            showPrizeButton.enable(false);
            msgBus.publish("allHandsDone");
            stopIdle();
            let count = 0;
            const pause = gr.animMap._handWinAnim_0.maxTime;
            if (revealAllTriggered) {
                Hands.forEach(hand => {
                    if (!hand.done) {
                        gr.getTimer().setTimeout(function() {
                            hand.showWinAnim();
                        }, (count++) * pause);
                    }
                });
            }
            gr.getTimer().setTimeout(
                function() {
                    if (triggerBonusHand > -1) { //reveal all
                        if (luckyBonusTriggered) {
                            if (luckyBonusEnd) {
                                msgBus.publish("startLuckyHand");
                            }
                        } else {
                            msgBus.publish("startLuckyBonusPicker");
                        }
                    } else { //trigger luckyHand
                        msgBus.publish("startLuckyHand");
                    }
                }, count * pause);
        }
    });
    msgBus.subscribe("backToBaseDone", function() {
        luckyBonusEnd = true;
        // const allHandsDone =  Hands.reduce(function(preResult, hand){
        //     return preResult & hand.done;
        // },true);
        if (allHandsDone) {
            revealAllButton.show(false);
            msgBus.publish("startLuckyHand");
        } else {
            revealAllButton.show(SKBeInstant.config.autoRevealEnabled);
            enableRevealAllButton();
            showPrizeButton.enable(true);

            Hands.forEach(hand => {
                if (!hand.revealed) {
                    hand.enable();
                }
            });
            msgBus.publish("enableButtonInfo");
        }
    });

    msgBus.subscribe('jLottery.beginNewGame', function() {
        inGame = false;
        SKBeInstant.config.gameType = "normal";
        revealAllButton.show(false);
        showPrizeButton.enable(true);
    });

    msgBus.subscribe('winboxError', onWinBoxError);
    msgBus.subscribe("addIdle", addIdle);
    msgBus.subscribe("stopIdle", stopIdle);
    msgBus.subscribe('tutorialIsShown', function() {
        if (inGame) {
            if (!allHandsDone) {
                disableRevealAllButton();
                Hands.forEach(hand => {
                    if (!hand.revealed) {
                        hand.disable();
                    }
                });
            }
        }
        showPrizeButton.enable(false);
        if (gr.lib._prizeTable.pixiContainer.visible) {
            hidePrizeButton.enable(false);
        }
    });
    msgBus.subscribe('tutorialIsHide', function() {
        if (inGame) {
            if (!allHandsDone) {
                enableRevealAllButton();
                showPrizeButton.enable(true);
                Hands.forEach(hand => {
                    if (!hand.revealed) {
                        hand.enable();
                    }
                });
            }
        } else {
            if (!gr.lib._prizeTable.pixiContainer.visible) {
                showPrizeButton.enable(true);
            }
        }
        hidePrizeButton.enable(true);

    });
    msgBus.subscribe('showTutorialAtBeginning', () => {
        showTutorialAtBeginning = true;
    });
});