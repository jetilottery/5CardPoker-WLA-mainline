define([
    'skbJet/componentCRDC/splash/splashLoadController',
    'skbJet/componentCRDC/splash/splashUIController'
], function(splashLoadController, splashUIController) {
    var predefinedData = {
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
    };

    var softId = window.location.search.match(/&?softwareid=(\d+.\d+.\d+)?/);
    var showCopyRight = false;
    if (softId) {
        if (softId[1].split('-')[2].charAt(0) !== '0') {
            showCopyRight = true;
        }
    }

    function onLoadDone() {
        splashUIController.onSplashLoadDone();
        window.postMessage('splashLoaded', window.location.origin);
    }

    function init() {
        splashUIController.init({ layoutType: 'IW', predefinedData: predefinedData, showCopyRight: showCopyRight });
        splashLoadController.load(onLoadDone);
    }
    init();
    return {};
});
