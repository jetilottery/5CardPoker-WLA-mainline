/**
 * @module control some game config
 * @description control the customized data of paytable&help page and other customized config


 <api-key key="nloxrgynWRqU5B55HlN4lY8l8sO27A9xZ2Hq" roles="eiGame"/>
 */
define({
    style: {
        //button_label:{dropShadow: true, dropShadowDistance: -4, dropShadowAlpha: 0.8, dropShadowBlur: 10, dropShadowAngle: -Math.PI / 4, dropShadowColor: "#cc4e12"},
        buttonTextStyle: { dropShadow: true, dropShadowAngle: 1.5, dropShadowColor: "#fffffe", dropShadowDistance: 2 },
        whiteTextStyle: {
            dropShadow: true,
            dropShadowAlpha: 0.7,
            dropShadowAngle: 1,
            dropShadowColor: "#00020c",
            dropShadowDistance: 2,
            lineJoin: "bevel",
            fontSize: 28
        },
        yellowTextStyle: {
            dropShadow: true,
            dropShadowAlpha: 0.7,
            dropShadowAngle: 1,
            dropShadowColor: "#00020c",
            dropShadowDistance: 2,
            lineJoin: "bevel"
        },
        winUpToValue: { dropShadow: true, dropShadowAngle: 1.5, dropShadowColor: "#00000f", dropShadowDistance: 4 }

    },
    backgroundStyle: {
        "splashSize": "100% 100%",
        "gameSize": "100% 100%"
    },
    winMaxValuePortrait: true,
    winUpToTextFieldSpace: 10,
    Opacity: 0.5,
    textAutoFit: {
        "mainIntroText": {
            "isAutoFit": true,
        },
        "noMoreChainText": {
            "isAutoFit": true,
        },
        "priceTableHeaderText": {
            "isAutoFit": true,
        },
        "autoPlayText": {
            "isAutoFit": true
        },
        "autoPlayMTMText": {
            "isAutoFit": true
        },
        "buyText": {
            "isAutoFit": true
        },
        "playText": {
            "isAutoFit": true
        },
        "tryText": {
            "isAutoFit": true
        },
        "quickPickText": {
            "isAutoFit": true
        },
        "clearText": {
            "isAutoFit": true
        },
        "speedText": {
            "isAutoFit": true
        },
        "warningExitText": {
            "isAutoFit": true
        },
        "warningContinueText": {
            "isAutoFit": true
        },
        "warningText": {
            "isAutoFit": true
        },
        "errorExitText": {
            "isAutoFit": true
        },
        "winBoxExitText": {
            "isAutoFit": true
        },
        "errorTitle": {
            "isAutoFit": true
        },
        "errorText": {
            "isAutoFit": false
        },
        "exitText": {
            "isAutoFit": true
        },
        "playAgainText": {
            "isAutoFit": true
        },
        "playAgainMTMText": {
            "isAutoFit": true
        },
        "MTMText": {
            "isAutoFit": true
        },
        "win_Text": {
            "isAutoFit": true
        },
        "win_Try_Text": {
            "isAutoFit": true
        },
        "win_Value": {
            "isAutoFit": true
        },
        "closeWinText": {
            "isAutoFit": true
        },
        "nonWin_Text": {
            "isAutoFit": true
        },
        "closeNonWinText": {
            "isAutoFit": true
        },
        "win_Value_color": {
            "isAutoFit": true
        },
        "ticketCostText": {
            "isAutoFit": true
        },
        "ticketCostValue": {
            "isAutoFit": true
        },
        "spotText": {
            "isAutoFit": true
        },
        "spotFrequency": {
            "isAutoFit": true
        },
        "tutorialTitleText": {
            "isAutoFit": true
        },
        "closeTutorialText": {
            "isAutoFit": true
        },
        "winUpToText": {
            "isAutoFit": true
        },
        "winUpToValue": {
            "isAutoFit": true
        },
        "multiplierText": {
            "isAutoFit": true
        },
        "prizeTableText": {
            "isAutoFit": true
        },
        "matchText": {
            "isAutoFit": true
        },
        "prizeText": {
            "isAutoFit": true
        },
        "prizeWinText": {
            "isAutoFit": true
        },
        "versionText": {
            "isAutoFit": true
        },
        "payTable": {
            "isAutoFit": true
        },
        "goButtonText": {
            "isAutoFit": true
        },
        "winBoxErrorText": {
            "isAutoFit": true
        }
    },
    audio: {
        "ButtonGeneric": {
            "name": "UI_Click",
            "channel": 34
        },
        "PaytableClose": {
            "name": "UI_Click",
            "channel": 34
        },
        "PaytableOpen": {
            "name": "UI_Click",
            "channel": 34
        },
        "ButtonBetMax": {
            "name": "BetMax",
            "channel": "16"
        },
        "ButtonBetUp": {
            "name": "BetUp",
            "channel": ["13", "14", "15"]
        },
        "ButtonBetDown": {
            "name": "BetDown",
            "channel": ["15", "14", "13"]
        },
        "Win": {
            "name": "BackgroundMusicTerm_WIN",
            "channel": "0"
        },
        "Lose": {
            "name": "BackgroundMusicTerm_LOSE",
            "channel": "0"
        },
        "gameLoop": {
            "name": "BackgroundMusicLoop",
            "channel": "0"
        },
        "BonusMusicLoop": {
            "name": "BonusMusicLoop",
            "channel": "0"
        },
        "ButtonBuy": {
            "name": "BuyButton",
            "channel": "2"
        },
        "CardFlip": {
            "name": "CardFlip",
            "channel": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
        },
        "PrizeHandMatch": {
            "name": "PrizeHandMatch",
            "channel": [13, 14, 15, 16, 17, 18]
        },
        "5CardFlip": {
            "name": "5CardFlip",
            "channel": [20, 21, 22, 23, 24, 25]
        },
        "GoldenChip": {
            "name": "GoldenChip",
            "channel": 26
        },
        "Transition": {
            "name": "Transition",
            "channel": 27
        },
        "ChooseSuit": {
            "name": "ChooseSuit",
            "channel": 1
        },
        "SuitMatch": {
            "name": "SuitMatch",
            "channel": [13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24]
        },
        "PrizeChime_1": {
            "name": "PrizeChime_1",
            "channel": 25
        },
        "PrizeChime_2": {
            "name": "PrizeChime_2",
            "channel": 26
        },
        "PrizeChime_3": {
            "name": "PrizeChime_3",
            "channel": 27
        },
        "PrizeChime_4": {
            "name": "PrizeChime_4",
            "channel": 28
        },
        "PrizeChime_5": {
            "name": "PrizeChime_5",
            "channel": 29
        },
        "PrizeChime_6": {
            "name": "PrizeChime_6",
            "channel": 30
        },
        "PrizeChime_7": {
            "name": "PrizeChime_7",
            "channel": 31
        },
        "PrizeChime_8": {
            "name": "PrizeChime_8",
            "channel": 32
        },
        "PrizeChime_9": {
            "name": "PrizeChime_9",
            "channel": 33
        },
        "FinalPrizeChime": {
            "name": "FinalPrizeChime",
            "channel": 34
        },
        "LuckyHandTransition": {
            "name": "LuckyHandTransition",
            "channel": 14
        },
        "LuckyHandCardMatch": {
            "name": "LuckyHandCardMatch",
            "channel": [15, 16, 17, 18, 19]
        },
        "LuckyHandWin": {
            "name": "LuckyHandWin",
            "channel": [20, 21, 22, 23, 24]
        }

    },
    gladButtonImgName: {
        //audioController
        "buttonAudioOn": "soundOnButton",
        "buttonAudioOff": "soundOffButton",

        "AllPanelOKButton": "tutorialOkButton",

        ticketCostPlus: 'plusButton',
        ticketCostMinus: 'minusButton',

        "iconOn": "tutorialPageIndicatorActive",
        "iconOff": "tutorialPageIndicatorInactive",

        tutorialButtonClose: "tutorialOkButton",
        buttonTry: "mainButton",
        buttonBuy: "mainButton",
        buttonExit: "mainButton",
        buttonMTM: "mainButton",
        buttonHome: "homeButton",
        buttonInfo: "tutorialButton",
        warningContinueButton: "timeOutButton",
        warningExitButton: "timeOutButton",
        errorExitButton: "timeOutButton",
        winBoxErrorExitButton: "tutorialOkButton",
        tutorialLeft: "tutorialLeftButton",
        tutorialRight: "tutorialRightButton",
    },
    gladButtonHitArea: {
        soundOnButton: [20, 20, 76, 76],
        soundOffButton: [20, 20, 76, 76],
        homeButton: [20, 20, 76, 76],
        tutorialButton: [20, 20, 76, 76],
        minusButton: [20, 20, 66, 65],
        plusButton: [20, 20, 66, 65],
        mainButton: [20, 20, 249, 80],
        tutorialOkButton: [10, 10, 248, 80],
        timeOutButton: [10, 10, 211, 68],
        prizeHandButton: [10, 10, 328, 44],
        tutorialLeftButton: [10, 10, 55, 174],
        tutorialRightButton: [10, 10, 55, 174]
    },
    gameParam: {
        //tutorialController
        "pageNum": 5,
        "arrowPlusSpecial": true,
        "popUpDialog": true
    },
    predefinedStyle: {
        "swirlName": "loadingSwirl",
        "backgroundSize": "cover",
        landscape: {
            "splashLogoName": "landscape_gameLogo",
            canvas: {
                width: 1440,
                height: 810,
                landscapeMargin: 0
            },
            gameImgDiv: {
                width: 1440,
                height: 810,
                top: 0
            },
            gameLogoDiv: {
                width: 734,
                height: 380,
                y: 370
            },
            progressSwirl: {
                width: 102,
                height: 102,
                animationSpeed: 0.5,
                loop: true,
                y: 650,
                scale: {
                    x: 1.2,
                    y: 1.2
                }
            },
            progressTextDiv: {
                y: 650,
                style: {
                    fontSize: 25,
                    fill: "#ffffff",
                    fontWeight: 800,
                    fontFamily: '"Oswald"'
                    // stroke: "#3800a5",
                    // strokeThickness:6
                }
            },
            copyRightDiv: {
                bottom: 20,
                fontSize: 20,
                color: "#d4c5fb",
                fontFamily: '"Arial"'
            }
        },
        portrait: {
            "splashLogoName": "portrait_gameLogo",
            canvas: {
                width: 810,
                height: 1440
            },
            gameImgDiv: {
                width: 810,
                height: 1440,
                top: 0
            },
            gameLogoDiv: {
                width: 691,
                height: 380,
                y: 500
            },
            progressSwirl: {
                width: 102,
                height: 102,
                animationSpeed: 0.5,
                loop: true,
                y: 1000,
                scale: {
                    x: 1.2,
                    y: 1.2
                }
            },
            copyRightDiv: {
                bottom: 20,
                fontSize: 18,
                color: "#d4c5fb",
                fontFamily: '"Arial"'
            },
            progressTextDiv: {
                y: 1000,
                style: {
                    fontSize: 25,
                    fill: "#ffffff",
                    fontWeight: 800,
                    fontFamily: '"Oswald"'
                    // stroke: "#3800a5",
                    // strokeThickness:6
                }
            }
        }
    },
    gamePocker: {
        baseGameSuits: {
            0: "Clubs",
            1: "Diamonds",
            2: "Hearts",
            3: "Spades"
        },
        baseGameRank: {
            1: "A",
            2: "2",
            3: "3",
            4: "4",
            5: "5",
            6: "6",
            7: "7",
            8: "8",
            9: "9",
            10: "10",
            11: "J",
            12: "Q",
            0: "K"
        },
        bonus: {
            suitStartIndex: [40, 27, 14, 1],
            "Clubs": {
                1: "Clubs",
                14: "Diamonds",
                27: "Hearts",
                40: "Spades"
            },
            "Diamonds": {
                1: "Diamonds",
                14: "Hearts",
                27: "Spades",
                40: "Clubs"
            },
            "Hearts": {
                1: "Hearts",
                14: "Spades",
                27: "Clubs",
                40: "Diamonds"
            },
            "Spades": {
                1: "Spades",
                14: "Clubs",
                27: "Diamonds",
                40: "Hearts"
            }
        }
    }

});