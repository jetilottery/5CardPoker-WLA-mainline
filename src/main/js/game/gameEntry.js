define(function module(require){

	require('game/component/ruller');
	require('game/engineCustomised');
    require('game/configController');
	require('game/gameSizeController');
	require('skbJet/componentCRDC/IwGameControllers/audioController');
	require('game/loadController');
	require('game/component/storePrize');
	require('game/paytableHelpController');
    require('game/utils/gameUtils');
	require('game/buyAndTryController');
	require('game/errorWarningController');
	require('game/exitAndHomeController');
	require('game/metersController');
	require('game/playWithMoneyController');
	require('game/resultController');
	require('game/ticketCostController');
    require('game/winUpToController');
    require('game/tutorialController');
    require('game/baseGameController');
	require('skbJet/componentCRDC/IwGameControllers/jLotteryInnerLoarderUIController');
	const luckyBonusController = require('game/luckyBonusController');
	const luckyHandCotroller = require('game/luckyHandCotroller');

	new luckyBonusController();
	new luckyHandCotroller();

	// const gr = require('skbJet/component/gladPixiRenderer/gladPixiRenderer');
	// window.gr = gr;

	return {};	
});
	
