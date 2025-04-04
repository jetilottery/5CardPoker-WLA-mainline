define([
    'skbJet/component/gameMsgBus/GameMsgBus',
    'skbJet/component/SKBeInstant/SKBeInstant'
],function (msgBus,SKBeInstant) {

    let handWin = {};
    let luckyBonusWin = {};
    let luckyHandWin = {};
    let totalWin = 0; 

    function setPrize(prizePoint){
        handWin = {};
        luckyBonusWin = {};
        luckyHandWin = {};
        let rc = SKBeInstant.config.gameConfigurationDetails.revealConfigurations;
        for (let i = 0; i < rc.length; i++) {
            if (Number(prizePoint) === Number(rc[i].price)) {
                let pt = rc[i].prizeTable;
                pt.forEach(element => {
                    let des = element.description;
                    const value = Number(element.prize);
                    if (/B\d/.test(des)) {
                        luckyBonusWin[des.substring(1)] = value;
                    } else if(/^[A-H]/.test(des)){
                        handWin[des.charAt(0)] = value;
                    }else if (/L[5432]/.test(des)) {
                        luckyHandWin[des.substring(1)] = value;
                    }
                });
            }
        }
    }

    function getBaseWinPrize(){
        return handWin;
    }

    function getLuckyBonusWin(){
        return luckyBonusWin;
    }

    function getLuckyHandWin(){
        return luckyHandWin;
    }

    function getTotalWin(){
        return totalWin;
    }

    function addTotalWin(value){
        totalWin += value;
        return totalWin;
    }
    
    msgBus.subscribe('ticketCostChanged', setPrize);

    msgBus.subscribe('jLottery.reStartUserInteraction', function () {
        totalWin = 0;
    });
    msgBus.subscribe('jLottery.startUserInteraction', function () {
        totalWin = 0;
    });

    return{
        getBaseWinPrize:getBaseWinPrize,
        getLuckyBonusWin:getLuckyBonusWin,
        getLuckyHandWin: getLuckyHandWin,
        getTotalWin:getTotalWin,
        addTotalWin:addTotalWin
    };
});