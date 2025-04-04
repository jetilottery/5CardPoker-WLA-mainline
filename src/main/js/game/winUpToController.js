/**
 * @module game/winUpToController
 * @description WinUpTo control
 */
define([
    'skbJet/component/gameMsgBus/GameMsgBus',
    'skbJet/component/gladPixiRenderer/gladPixiRenderer',
    'skbJet/component/pixiResourceLoader/pixiResourceLoader',
    'skbJet/component/SKBeInstant/SKBeInstant',
    'game/utils/gameUtils',
    'game/configController'
], function (msgBus, gr, loader, SKBeInstant, gameUtils, config) {

    var currentPrice = 0;
    var winMaxPrize = 0;
    var winUptoIndex = 0;
    var winDowntoIndex = 0;
    var oldMaxPrize = 0;
    var firstTicketCostChange = true;
    var textStyleSeted = false;
    // In portrait mode, these two textfields in one line but in lanscape mode, they're positioned in two lines. 

    function setComplete() {
        for (var i = 0; i < 3; i++) {
            gr.animMap['_winUpToMinus_' + i]._onComplete = function () {
                gr.lib['_winUpTo_' + this.index].setText(loader.i18n.Game.win_up_to + SKBeInstant.formatCurrency(winMaxPrize).formattedAmount + loader.i18n.Game.win_up_to_mark);
                //fix();
            };

            gr.animMap['_winUpToPlus_' + i]._onComplete = function () {
                gr.lib['_winUpTo_' + this.index].setText(loader.i18n.Game.win_up_to + SKBeInstant.formatCurrency(winMaxPrize).formattedAmount + loader.i18n.Game.win_up_to_mark);
                //fix();
            };
        }
    }
    
    function setTextStyle(){
        if (config.style.winUpToValue) {
            gameUtils.setTextStyle(gr.lib._winUpTo_0, config.style.winUpToValue);
            gameUtils.setTextStyle(gr.lib._winUpToT_0, config.style.winUpToValue);
            gameUtils.setTextStyle(gr.lib._winUpTo_1, config.style.winUpToValue);
            gameUtils.setTextStyle(gr.lib._winUpToT_1, config.style.winUpToValue);
            gameUtils.setTextStyle(gr.lib._winUpTo_2, config.style.winUpToValue);
            gameUtils.setTextStyle(gr.lib._winUpToT_2, config.style.winUpToValue);
        }
        if (config.textAutoFit.winUpToValue) {
            gr.lib._winUpTo_0.autoFontFitText = config.textAutoFit.winUpToValue.isAutoFit;
            gr.lib._winUpToT_0.autoFontFitText = config.textAutoFit.winUpToValue.isAutoFit;
            gr.lib._winUpTo_1.autoFontFitText = config.textAutoFit.winUpToValue.isAutoFit;
            gr.lib._winUpToT_1.autoFontFitText = config.textAutoFit.winUpToValue.isAutoFit;
            gr.lib._winUpTo_2.autoFontFitText = config.textAutoFit.winUpToValue.isAutoFit;
            gr.lib._winUpToT_2.autoFontFitText = config.textAutoFit.winUpToValue.isAutoFit;
        }
    }
    
    function onGameParametersUpdated() {
        if(!textStyleSeted){
            textStyleSeted = true;
            setTextStyle();
        }
    }
    
    function showWinUpTo(index) {
        switch (index) {
            case 0:
            {
                gr.lib['_winUpTo_0'].show(true);
                gr.lib['_winUpToT_0'].show(true);
                gr.lib['_winUpTo_1'].show(false);
                gr.lib['_winUpToT_1'].show(false);
                gr.lib['_winUpTo_2'].show(false);
                gr.lib['_winUpToT_2'].show(false);
                break;
            }
            case 1:
            {
                gr.lib['_winUpTo_0'].show(false);
                gr.lib['_winUpToT_0'].show(false);
                gr.lib['_winUpTo_1'].show(true);
                gr.lib['_winUpToT_1'].show(true);
                gr.lib['_winUpTo_2'].show(false);
                gr.lib['_winUpToT_2'].show(false);
                break;
            }
            case 2:
            {
                gr.lib['_winUpTo_0'].show(false);
                gr.lib['_winUpToT_0'].show(false);
                gr.lib['_winUpTo_1'].show(false);
                gr.lib['_winUpToT_1'].show(false);
                gr.lib['_winUpTo_2'].show(true);
                gr.lib['_winUpToT_2'].show(true);
                break;
            }
        }

    }
    function onTicketCostChanged(prizePoint) {
        if (firstTicketCostChange) {
            firstTicketCostChange = false;
            for (let i = 1; i < 3; i++) {
                gr.animMap['_winUpToPlus_0'].clone(['_winUpTo_' + i, '_winUpToT_' + i], '_winUpToPlus_' + i);
                gr.animMap['_winUpToMinus_0'].clone(['_winUpTo_' + i, '_winUpToT_' + i], '_winUpToMinus_' + i);
            }
            setComplete();
        }
        if(!textStyleSeted){
            textStyleSeted = true;
            setTextStyle();
        }
        var oldPrice = currentPrice;
        currentPrice = prizePoint;
        var rc = SKBeInstant.config.gameConfigurationDetails.revealConfigurations;
        for (let i = 0; i < rc.length; i++) {
            if (Number(prizePoint) === Number(rc[i].price)) {
                var ps = rc[i].prizeStructure;
                var maxPrize = 0;
                for (let j = 0; j < ps.length; j++) {
                    var prize = Number(ps[j].prize);
                    if (maxPrize < prize) {
                        maxPrize = prize;
                    }
                }
                oldMaxPrize = winMaxPrize;
                winMaxPrize = maxPrize;

                if (Number(oldPrice) > Number(currentPrice)) {
                    showWinUpTo(winDowntoIndex);
                    gr.lib['_winUpTo_' + winDowntoIndex].setText(loader.i18n.Game.win_up_to + SKBeInstant.formatCurrency(oldMaxPrize).formattedAmount + loader.i18n.Game.win_up_to_mark);
                    gr.lib['_winUpToT_' + winDowntoIndex].setText(loader.i18n.Game.win_up_to + SKBeInstant.formatCurrency(maxPrize).formattedAmount + loader.i18n.Game.win_up_to_mark);
                    //fix(winDowntoIndex);
                    gr.animMap['_winUpToMinus_' + winDowntoIndex].index = winDowntoIndex;
                    gr.animMap['_winUpToMinus_' + winDowntoIndex].play();
                    if (winDowntoIndex === 2) {
                        winDowntoIndex = 0;
                    } else {
                        winDowntoIndex++;
                    }
                } else if(Number(oldPrice) < Number(currentPrice)){
                    showWinUpTo(winUptoIndex);
                    if(oldPrice != 0){ //ticket ready is true, do not play winupto anim when enter in game
                        gr.lib['_winUpTo_' + winUptoIndex].setText(loader.i18n.Game.win_up_to + SKBeInstant.formatCurrency(oldMaxPrize).formattedAmount + loader.i18n.Game.win_up_to_mark);
                    }
                    gr.lib['_winUpToT_' + winUptoIndex].setText(loader.i18n.Game.win_up_to + SKBeInstant.formatCurrency(maxPrize).formattedAmount + loader.i18n.Game.win_up_to_mark);
                    //fix(winUptoIndex);
                    gr.animMap['_winUpToPlus_' + winUptoIndex].index = winUptoIndex;
                    if(oldPrice != 0){
                        gr.animMap['_winUpToPlus_' + winUptoIndex].play();
                    }
                    if (winUptoIndex === 2) {
                        winUptoIndex = 0;
                    } else {
                        winUptoIndex++;
                    }
                }else{
                    //nothing to do
                }
                return;
            }
        }
    }

    msgBus.subscribe('ticketCostChanged', onTicketCostChanged);
    msgBus.subscribe('SKBeInstant.gameParametersUpdated', onGameParametersUpdated);

    return {};
});