define([
    // 'skbJet/component/SKBeInstant/SKBeInstant'
    'game/configController',
    'skbJet/component/howlerAudioPlayer/howlerAudioSpritePlayer',
    'skbJet/component/gladPixiRenderer/Sprite',
    'com/pixijs/pixi'
], function (config,audio,Sprite, PIXI) {

    /**
     * @function obtainRandomElementOfArray
     * @description return a random element of an array.
     * @instance
     * @param arr {array} - source array
     * @return a random element in the source array
     */
    var currentOrientation = 'landscape';
    function obtainRandomElementOfArray(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    function setTextStyle(Sprite, style) {
        if (!Sprite.pixiContainer.$text) {
            Sprite.setText(" ");
        }
        for (var key in style) {
            Sprite.pixiContainer.$text.style[key] = style[key];
        }
    }

    //ramdom sort Array
    function randomSort(Array) {
        var len = Array.length;
        var i, j, k;
        var temp;

        for (i = 0; i < Math.floor(len / 2); i++) {
            j = Math.floor((Math.random() * len));
            k = Math.floor((Math.random() * len));
            while (k === j) {
                k = Math.floor((Math.random() * len));
            }
            temp = Array[j];
            Array[j] = Array[k];
            Array[k] = temp;
        }
    }

    // function fixMeter(gr, orientation) {//suggested font size is 20, _meterDivision0 and _meterDivision1 use font size 28
    //     if(orientation){ currentOrientation = orientation; }
    //     var balanceText = gr.lib._balanceText;
    //     var balanceValue = gr.lib._balanceValue;
    //     balanceValue.pixiContainer.$text.style.wordWrap = false;
    //     var meterDivision0 = gr.lib._meterDivision0;
    //     var ticketCostMeterText = gr.lib._ticketCostMeterText;
    //     var ticketCostMeterValue = gr.lib._ticketCostMeterValue;
    //     ticketCostMeterValue.pixiContainer.$text.style.wordWrap = false;
    //     var meterDivision1 = gr.lib._meterDivision1;
    //     var winsText = gr.lib._winsText;
    //     var winsValue = gr.lib._winsValue;
    //     var metersBG = gr.lib._metersBG;

    //     var len = metersBG._currentStyle._width;
    //     var temp/*, balanceLeft*/;
    //     var top4OneLine = metersBG._currentStyle._top + (metersBG._currentStyle._height - balanceText._currentStyle._text._lineHeight) / 2;
    //     var top4TwoLine0 = metersBG._currentStyle._top + (metersBG._currentStyle._height - balanceText._currentStyle._text._lineHeight * 2 ) / 2 ;
    //     var top4TwoLine1 = top4TwoLine0 + balanceText._currentStyle._text._lineHeight + 5;
    //     var barY = metersBG._currentStyle._top + (metersBG._currentStyle._height - meterDivision0._currentStyle._height) / 2;
    //     var nspliceWidth = len / 3;
    //     if (balanceText.pixiContainer.visible) {
    //         //balance text
    //         if (currentOrientation === 'portrait' || (!currentOrientation && SKBeInstant.getGameOrientation() === 'portrait')) {
    //             const left0 = (nspliceWidth - balanceText._currentStyle._width) / 2;
    //             balanceText.updateCurrentStyle({'_left': left0, '_top': top4TwoLine1, '_text':{'_align': 'center'}});
    //             const left1 = (nspliceWidth - balanceValue._currentStyle._width) / 2;
    //             balanceValue.updateCurrentStyle({'_left': left1, '_top': top4TwoLine0, '_text':{'_align': 'center'}});
    //             meterDivision0.updateCurrentStyle({'_left': nspliceWidth - meterDivision0._currentStyle._width/2, '_top': barY});
    //         } else {
    //             temp = (nspliceWidth - (balanceText.pixiContainer.$text.width + balanceValue.pixiContainer.$text.width + 10)) / 2;
    //             if (temp >= 6) {
    //                 balanceText.updateCurrentStyle({'_left': temp, '_top': top4OneLine + 2, '_text':{'_align': 'left'}});
    //                 balanceValue.updateCurrentStyle({'_left': balanceText._currentStyle._left + balanceText.pixiContainer.$text.width + 10, '_top': top4OneLine+2, '_text':{'_align': 'left'}});
    //             } else {
    //                 const left0 = (nspliceWidth - balanceText.pixiContainer.$text.width) / 2;
    //                 balanceText.updateCurrentStyle({'_left': left0, '_top': top4TwoLine1, '_text':{'_align': 'left'}});
    //                 const left1 = (nspliceWidth - balanceValue.pixiContainer.$text.width) / 2;
    //                 balanceValue.updateCurrentStyle({'_left': left1, '_top': top4TwoLine0, '_text':{'_align': 'left'}});
    //             }
    //             meterDivision0.updateCurrentStyle({'_left': nspliceWidth - 1, '_top': barY});
    //         }
    //         //ticket cost
    //         if (currentOrientation === 'portrait' || (!currentOrientation && SKBeInstant.getGameOrientation() === 'portrait')) {
    //             const left0 = (nspliceWidth - ticketCostMeterText._currentStyle._width) / 2;
    //             ticketCostMeterText.updateCurrentStyle({'_left': nspliceWidth + left0, '_top': top4TwoLine1, '_text':{'_align': 'center'}});
    //             const left1 = (nspliceWidth - ticketCostMeterValue._currentStyle._width) / 2;
    //             ticketCostMeterValue.updateCurrentStyle({'_left': nspliceWidth + left1, '_top': top4TwoLine0, '_text':{'_align': 'center'}});
    //             meterDivision1.updateCurrentStyle({'_left': nspliceWidth * 2 - meterDivision1._currentStyle._width/2, '_top': barY});
    //         } else {
    //             temp = (nspliceWidth - (ticketCostMeterText.pixiContainer.$text.width + ticketCostMeterValue.pixiContainer.$text.width + 10)) / 2;
    //             if (temp >= 6) {
    //                 ticketCostMeterText.updateCurrentStyle({'_left': nspliceWidth + temp, '_top': top4OneLine + 2, '_text':{'_align': 'left'}});
    //                 ticketCostMeterValue.updateCurrentStyle({'_left': ticketCostMeterText._currentStyle._left + ticketCostMeterText.pixiContainer.$text.width + 10, '_top': top4OneLine + 2, '_text':{'_align': 'left'}});
    //             } else {
    //                 const left0 = (nspliceWidth - ticketCostMeterText.pixiContainer.$text.width) / 2;
    //                 ticketCostMeterText.updateCurrentStyle({'_left': nspliceWidth + left0, '_top': top4TwoLine1, '_text':{'_align': 'left'}});
    //                 const left1 = (nspliceWidth - ticketCostMeterValue.pixiContainer.$text.width) / 2;
    //                 ticketCostMeterValue.updateCurrentStyle({'_left': nspliceWidth + left1, '_top': top4TwoLine0, '_text':{'_align': 'left'}});
    //             }
    //             meterDivision1.updateCurrentStyle({'_left': nspliceWidth * 2 - 1, '_top': barY});
    //         }
    //         //win text
    //         if (currentOrientation === 'portrait' || (!currentOrientation && SKBeInstant.getGameOrientation() === 'portrait')) {
    //             const left0 = (nspliceWidth - winsText._currentStyle._width) / 2;
    //             winsText.updateCurrentStyle({'_left': nspliceWidth * 2 + left0, '_top': top4TwoLine1, '_text':{'_align': 'center'}});
    //             const left1 = (nspliceWidth - winsValue._currentStyle._width) / 2;
    //             winsValue.updateCurrentStyle({'_left': nspliceWidth * 2 + left1, '_top': top4TwoLine0, '_text':{'_align': 'center'}});
    //         } else {
    //             temp = (nspliceWidth - (winsText.pixiContainer.$text.width + winsValue.pixiContainer.$text.width + 10)) / 2;
    //             if (temp >= 6) {
    //                 winsText.updateCurrentStyle({'_left': nspliceWidth * 2 + temp, '_top': top4OneLine + 2, '_text':{'_align': 'left'}});
    //                 winsValue.updateCurrentStyle({'_left': winsText._currentStyle._left + winsText.pixiContainer.$text.width + 10, '_top': top4OneLine + 2, '_text':{'_align': 'left'}});
    //             } else {
    //                 const left0 = (nspliceWidth - winsText.pixiContainer.$text.width) / 2;
    //                 winsText.updateCurrentStyle({'_left': nspliceWidth * 2 + left0, '_top': top4TwoLine1, '_text':{'_align': 'left'}});
    //                 const left1 = (nspliceWidth - winsValue.pixiContainer.$text.width) / 2;
    //                 winsValue.updateCurrentStyle({'_left': nspliceWidth * 2 + left1, '_top': top4TwoLine0, '_text':{'_align': 'left'}});
    //             }
    //         }
    //     } else {//balanceDisplayInGame is false
    //         meterDivision0.show(false);
    //         nspliceWidth = len / 2;
    //         if (currentOrientation === 'portrait' || (!currentOrientation && SKBeInstant.getGameOrientation() === 'portrait')) {
    //             const left0 = (nspliceWidth - ticketCostMeterText._currentStyle._width) / 2;
    //             ticketCostMeterText.updateCurrentStyle({'_left': left0, '_top': top4TwoLine1, '_text':{'_align': 'center'}});
    //             const left1 = (nspliceWidth - ticketCostMeterValue._currentStyle._width) / 2;
    //             ticketCostMeterValue.updateCurrentStyle({'_left': left1, '_top': top4TwoLine0, '_text':{'_align': 'center'}});
    //             meterDivision1.updateCurrentStyle({'_left': nspliceWidth - meterDivision1._currentStyle._width/2, '_top': (top4OneLine - 4)});
    //         } else {
    //             temp = (nspliceWidth - (ticketCostMeterText.pixiContainer.$text.width + ticketCostMeterValue.pixiContainer.$text.width + 10)) / 2;
    //             if (temp >= 6) {
    //                 ticketCostMeterText.updateCurrentStyle({'_left': temp, '_top': top4OneLine + 3, '_text':{'_align': 'left'}});
    //                 ticketCostMeterValue.updateCurrentStyle({'_left': ticketCostMeterText._currentStyle._left + ticketCostMeterText.pixiContainer.$text.width + 10, '_top': top4OneLine + 3, '_text':{'_align': 'left'}});
    //             } else {
    //                 const left0 = (nspliceWidth - ticketCostMeterText.pixiContainer.$text.width) / 2;
    //                 ticketCostMeterText.updateCurrentStyle({'_left': left0, '_top': top4TwoLine1, '_text':{'_align': 'left'}});
    //                 const left1 = (nspliceWidth - ticketCostMeterValue.pixiContainer.$text.width) / 2;
    //                 ticketCostMeterValue.updateCurrentStyle({'_left': left1, '_top': top4TwoLine0, '_text':{'_align': 'left'}});
    //             }
    //             meterDivision1.updateCurrentStyle({'_left': nspliceWidth - 1, '_top': (top4OneLine - 4)});
    //         }

    //         if (currentOrientation === 'portrait' || (!currentOrientation && SKBeInstant.getGameOrientation() === 'portrait')) {
    //             const left0 = (nspliceWidth - winsText._currentStyle._width) / 2;
    //             winsText.updateCurrentStyle({'_left': nspliceWidth + left0, '_top': top4TwoLine1, '_text':{'_align': 'center'}});
    //             const left1 = (nspliceWidth - winsValue._currentStyle._width) / 2;
    //             winsValue.updateCurrentStyle({'_left': nspliceWidth + left1, '_top': top4TwoLine0, '_text':{'_align': 'center'}});
    //         } else {
    //             temp = (nspliceWidth - (winsText.pixiContainer.$text.width + winsValue.pixiContainer.$text.width + 10)) / 2;
    //             if (temp >= 6) {
    //                 winsText.updateCurrentStyle({'_left': nspliceWidth + temp, '_top': top4OneLine + 3, '_text':{'_align': 'left'}});
    //                 winsValue.updateCurrentStyle({'_left': winsText._currentStyle._left + winsText.pixiContainer.$text.width + 10, '_top': top4OneLine + 3, '_text':{'_align': 'left'}});
    //             } else {
    //                 const left0 = (nspliceWidth - winsText.pixiContainer.$text.width) / 2;
    //                 winsText.updateCurrentStyle({'_left': nspliceWidth + left0, '_top': top4TwoLine1, '_text':{'_align': 'left'}});
    //                 const left1 = (nspliceWidth - winsValue.pixiContainer.$text.width) / 2;
    //                 winsValue.updateCurrentStyle({'_left': nspliceWidth + left1, '_top': top4TwoLine0, '_text':{'_align': 'left'}});
    //             }
    //         }
    //     }
    // }
    function fixMeter(gr, orientation) {//suggested font size is 20, _meterDivision0 and _meterDivision1 use font size 28
        if (orientation) {
            currentOrientation = orientation;
            const align = orientation === "portrait" ? "center" : "left";
            gr.lib._balanceText.updateCurrentStyle({ "_text": { "_align": align } });
            gr.lib._balanceValue.updateCurrentStyle({ "_text": { "_align": align } });
            gr.lib._ticketCostMeterText.updateCurrentStyle({ "_text": { "_align": align } });
            gr.lib._ticketCostMeterValue.updateCurrentStyle({ "_text": { "_align": align } });
            gr.lib._winsText.updateCurrentStyle({ "_text": { "_align": align } });
            gr.lib._winsValue.updateCurrentStyle({ "_text": { "_align": align } });
        }

        const isPortrait = currentOrientation === "portrait";

        var balanceText = gr.lib._balanceText;
        var balanceValue = gr.lib._balanceValue;
        balanceValue.pixiContainer.$text.style.wordWrap = false;

        var meterDivision0 = isPortrait ? gr.lib._meterDivision0_P : gr.lib._meterDivision0;
        var meterDivision1 = isPortrait ? gr.lib._meterDivision1_P : gr.lib._meterDivision1;

        var ticketCostMeterText = gr.lib._ticketCostMeterText;
        var ticketCostMeterValue = gr.lib._ticketCostMeterValue;
        ticketCostMeterValue.pixiContainer.$text.style.wordWrap = false;

        var winsText = gr.lib._winsText;
        var winsValue = gr.lib._winsValue;
        var metersBG = isPortrait ? gr.lib._metersBG_P : gr.lib._metersBG;
        var len = metersBG._currentStyle._width;
        const meterOriginalLeft = metersBG._currentStyle._left;
        const halfDivisionWidth = meterDivision0._currentStyle._width / 2;
        const SPACE = 10;


        if (balanceText.pixiContainer.visible) {
            const part = len / 3;
            meterDivision0.updateCurrentStyle({ "_left": part - halfDivisionWidth });
            meterDivision0.show(true);
            meterDivision1.updateCurrentStyle({ "_left": part * 2 - halfDivisionWidth });
            if (isPortrait) {
                balanceText.updateCurrentStyle({ "_left": meterOriginalLeft + (part - halfDivisionWidth - balanceText._currentStyle._width) / 2 });
                balanceValue.updateCurrentStyle({ "_left": meterOriginalLeft + (part - halfDivisionWidth - balanceValue._currentStyle._width) / 2 });

                ticketCostMeterText.updateCurrentStyle({ "_left": meterOriginalLeft + meterDivision0._currentStyle._left + (part - ticketCostMeterText._currentStyle._width) / 2 });
                ticketCostMeterValue.updateCurrentStyle({ "_left": meterOriginalLeft + meterDivision0._currentStyle._left + (part - ticketCostMeterValue._currentStyle._width) / 2 });

                winsText.updateCurrentStyle({ "_left": meterOriginalLeft + meterDivision1._currentStyle._left + (part - winsText._currentStyle._width) / 2 });
                winsValue.updateCurrentStyle({ "_left": meterOriginalLeft + meterDivision1._currentStyle._left + (part - winsValue._currentStyle._width) / 2 });
            } else {
                let textWidth = balanceText.pixiContainer.$text.width + SPACE + balanceValue.pixiContainer.$text.width;
                balanceText.updateCurrentStyle({ "_left": meterOriginalLeft + (part - textWidth) / 2 });
                balanceValue.updateCurrentStyle({ "_left": balanceText._currentStyle._left + balanceText.pixiContainer.$text.width + SPACE });

                textWidth = ticketCostMeterText.pixiContainer.$text.width + SPACE + ticketCostMeterValue.pixiContainer.$text.width;
                ticketCostMeterText.updateCurrentStyle({ "_left": meterOriginalLeft + meterDivision0._currentStyle._left + (part - textWidth) / 2 });
                ticketCostMeterValue.updateCurrentStyle({ "_left": ticketCostMeterText._currentStyle._left + ticketCostMeterText.pixiContainer.$text.width + SPACE });

                textWidth = winsText.pixiContainer.$text.width + SPACE + winsValue.pixiContainer.$text.width;
                winsText.updateCurrentStyle({ "_left": meterOriginalLeft + meterDivision1._currentStyle._left + (part - textWidth) / 2 });
                winsValue.updateCurrentStyle({ "_left": winsText._currentStyle._left + winsText.pixiContainer.$text.width + SPACE });
            }

        } else {
            const part = len / 2;
            const width = part - halfDivisionWidth;
            meterDivision0.show(false);
            meterDivision1.updateCurrentStyle({ "_left": width });

            if (isPortrait) {
                ticketCostMeterText.updateCurrentStyle({ "_left": meterOriginalLeft + (width - ticketCostMeterText._currentStyle._width) / 2 });
                ticketCostMeterValue.updateCurrentStyle({ "_left": meterOriginalLeft + (width - ticketCostMeterValue._currentStyle._width) / 2 });

                winsText.updateCurrentStyle({ "_left": meterOriginalLeft + part + halfDivisionWidth + (width - winsText._currentStyle._width) / 2 });
                winsValue.updateCurrentStyle({ "_left": meterOriginalLeft + part + halfDivisionWidth + (part - winsValue._currentStyle._width) / 2 });
            } else {
                let textWidth = ticketCostMeterText.pixiContainer.$text.width + SPACE + ticketCostMeterValue.pixiContainer.$text.width;
                ticketCostMeterText.updateCurrentStyle({ "_left": meterOriginalLeft + (part - textWidth) / 2 });
                ticketCostMeterValue.updateCurrentStyle({ "_left": ticketCostMeterText._currentStyle._left + ticketCostMeterText.pixiContainer.$text.width + SPACE });

                textWidth = winsText.pixiContainer.$text.width + SPACE + winsValue.pixiContainer.$text.width;

                winsText.updateCurrentStyle({ "_left": meterOriginalLeft + part + halfDivisionWidth + (width - textWidth) / 2 });
                winsValue.updateCurrentStyle({ "_left": winsText._currentStyle._left + winsText.pixiContainer.$text.width + SPACE });
            }
        }

    }
    /**
     * @function fontFitWithAutoWrap
     * @description Adjust text with style 'wordWrap = true' to fit its container's size
     * @instance
     * @param sprite{object} - the child node $text of which needs to fit its size
     */
    function fontFitWithAutoWrap(sprite, minFontSize) {
        var txtSpr = sprite.pixiContainer.$text;
        if (txtSpr) {
            var ctnHeight = sprite._currentStyle._height;
            var txtHeight = txtSpr.height;
            while (txtHeight > ctnHeight) {
                txtSpr.style.fontSize--;
                txtHeight = txtSpr.height;
                if (txtSpr.style.fontSize <= minFontSize) {
                    break;
                }
            }
            if (txtHeight > ctnHeight) {
                var scale = ctnHeight / txtHeight;
                txtSpr.scale.set(scale);
            }
            txtSpr.y = Math.floor((ctnHeight - txtSpr.height) / 2);
        }
    }

    /**
     * @function keepSameSizeWithMTMText
     * @description keep some sprite font size is the same as MTM text
     * @instance
     * @param sprite{object} - the sprite needs to keep same as MTM text
     * @gladPixiRenderer gladPixiRenderer{object}
     */
    function keepSameSizeWithMTMText(sprite, gladPixiRenderer) {
        var gr = gladPixiRenderer;
        if (gr.lib._MTMText) {
            var xScale = gr.lib._MTMText.pixiContainer.$text.scale._x;
            var sText;
            if (sprite) {
                var sp = sprite.pixiContainer;
                /* var sst = sprite._currentStyle;
                var spWidth = Number(sst._width);
                var spHeight = Number(sst._height);*/
                sText = sp.$text;
                sText.scale.set(xScale);

                /*sText.y = Math.floor(spHeight * (1 - sText.scale.y) / 2);
                var align = sText.style.align;
                if (align === 'right') {
                    sText.x = spWidth - sText.width;
                } else if (align === 'center') {
                    sText.x = sp.x - sText.width / 2 - Number(sst._left);
                } else {
                    sText.x = 0;
                }*/
            }
        }
    }

    function setButtonHitArea(symbol, imageName){
        const area = config.gladButtonHitArea[imageName];
        if(area){
            symbol.pixiContainer.$sprite.hitArea = new PIXI.Rectangle(area[0],area[1],area[2],area[3]);
        }
    }

    function setSpineStype(symbol, spineStyle) {
        symbol.styleData = spineStyle;
        symbol.scale.x = spineStyle.scaleX;
        symbol.scale.y = spineStyle.scaleY;
        symbol.x = spineStyle.x;
        symbol.y = spineStyle.y;
    }

    function resetSpine(spineObj) {
        const wasVisible = spineObj.visible;
        spineObj.lastTime = 0;
        spineObj.visible = true;
        if (!wasVisible) {
            spineObj.updateTransform();
        }
    }

    function playSoundByConfig (soundName, isloop = false) {
		if (config.audio && config.audio[soundName]) {
			const channel = config.audio[soundName].channel;
			if(!config.audio[soundName].hasOwnProperty("currentIndex")){
				config.audio[soundName].currentIndex = 0;
			}
			if (Array.isArray(channel)) {
				audio.play(config.audio[soundName].name, channel[config.audio[soundName].currentIndex++ % channel.length]);
			} else {
				audio.play(config.audio[soundName].name, channel, isloop);
			}
		}
	}

    function addReverseAnim(animName){
        if(Sprite.getSpriteSheetAnimationFrameArray(animName+"R")){
            return;
        }
        let animArray = Sprite.getSpriteSheetAnimationFrameArray(animName);
        if(animArray){
            let array = [];
            for(let i=animArray.length-1; i>=0; i--){
                array.push(animArray[i]);
            }            
            Sprite.addSpriteSheetAnimation(animName+"R", array);
        }
    }

    return {
        obtainRandomElementOfArray: obtainRandomElementOfArray,
        setTextStyle: setTextStyle,
        randomSort: randomSort,
        fixMeter: fixMeter,
        fontFitWithAutoWrap: fontFitWithAutoWrap,
        keepSameSizeWithMTMText: keepSameSizeWithMTMText,
        setSpineStype: setSpineStype,
        resetSpine:resetSpine,
        playSoundByConfig:playSoundByConfig,
        addReverseAnim:addReverseAnim,
        setButtonHitArea:setButtonHitArea
    };
});

