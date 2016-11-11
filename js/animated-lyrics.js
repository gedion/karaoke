/** =======================================================================
 *  Vincent Hardy
 *  License terms: see svg-wow.org
 *  CC0 http://creativecommons.org/publicdomain/zero/1.0/
 *  ======================================================================= */

var sw = sw || {};

sw.animatedLyrics = sw.animatedLyrics || {};

sw.animatedLyrics.init = function () {
    var Animate = sw.animation.Animate;
    var playing = false;
    var playList = [];
    var beatList = [];
    var beatPos = [];
    var beatListSize = 20;
    var previousOffset = 0;
    var secondsRegxp = /(\d+[.]{0,1}\d*)s/;
    var minutesRegxp = /(\d+):(\d+[.]{0,1}\d)/;
    var audio = getAudio();
    var song = sw.audio.collection.getSongs()[0];
    var nLines = song.timing.length;
    var songText = $("songText");
    var beats = $("beats");
    var nextFadeInEnd = undefined;
    var fadeInDur = 0.4;
    var speedFadeOutDur = 0.4;
    var fadeOutDur = 7;
    var minFadeOutDur = speedFadeOutDur + 0.2;
    var curFadeInDur;
    var curFadeOutDur;
    var p;
    var fadeIn;
    var fadeOut;
    var speedFadeOut;
    var s;
    var startTime;
    var nextBeat = -1;
    var attributionsAnim;
    var startBeat;

    var beatTween = {
        _onStart: {
            fire: function() {}
        },
        isAnimated : function () { return true; },
        currentFrame : 0,
        totalFrames : null,
        useSeconds : false,
        _onTween : {
            fire: function() {
                checkStartBeat();
            }
        }
    };

    yui.util.AnimMgr.registerElement(beatTween);

    if (audio.load !== undefined) {
        audio.load();
    }

    if (song.timingOffset === undefined) {
        song.timingOffset = 0;
    }

    for (var i = 0; i < nLines; i++) {
        var l = song.timing[i];
        var t = document.createElementNS(sw.svgNS, 'text');
    var tp = document.createElementNS(sw.svgNS, 'textPath');

    t.appendChild(tp);
        tp.appendChild(document.createTextNode(l[1].toLowerCase()));
        tp.setAttribute("startOffset", (25 + 50 * Math.random()) + "%");
    // tp.setAttribute("text-anchor", "middle");
        tp.setAttributeNS(sw.xlinkNS, "href", "#linePath");

        if (i < nLines - 1) {
            // Timing is in milliseconds
            nextFadeInEnd = (song.timing[i + 1][0] - l[0]) / 1000 + fadeInDur;
        }

        curFadeInDur = Math.min(fadeInDur, nextFadeInEnd);

        fadeIn = new Animate(t, {
                txf: {
                    from: {sx: 0.2, r: 80 * (Math.random() - 0.5)},
                    to: {sx: 1.3, r: 0},
                    template: "scale(#sx) rotate(#r)"
                }
            }, curFadeInDur, yui.util.Easing.easeIn);

        fadeIn.onBegin(getStartHandler(t, songText));
        curFadeOutDur = Math.min(fadeOutDur, nextFadeInEnd - curFadeInDur);

        if (curFadeOutDur > minFadeOutDur) {
            // We have time for a slow fade out phase. We want a slow speed,
            // even if se do not have the full fadeOutDur.
            p = curFadeOutDur / fadeOutDur;

            s = 5 * p + 1.3 * (1 - p);
            fadeOut = new Animate(t, {
                    txf: {
                        to: {sx: s},
                        by: {r: 80 * (Math.random() - 0.5)},
                        template: "scale(#sx) rotate(#r)"
                    },
            opacity: {from: 1, to: 0}
                }, curFadeOutDur, undefined);


            fadeIn.onEnd(fadeOut);

            if (p < 1) {
                speedFadeOut = new Animate(t, {
            opacity: {to: 0},
                        txf: {
                            from: {sx: s},
                            to: {sx: 5},
                            by: {r: 80 * (Math.random() - 0.5)},
                            template: "scale(#sx) rotate(#r)"
                        }
                    }, speedFadeOutDur, undefined);
                fadeOut.onEnd(speedFadeOut);
                speedFadeOut.onEnd(getStopHandler(t, songText));
            } else {
                fadeOut.onEnd(getStopHandler(t, songText));
            }
        } else {
            // No time for slow fade out. Speed the line out.
            speedFadeOut = new Animate(t, {
                opacity: {to: 0},
                    txf: {
                        to: {sx: 5, r: 60 * (Math.random() - 0.5)},
                        template: "scale(#sx) rotate(#r)"
                    }
                    }, speedFadeOutDur, undefined);
            fadeIn.onEnd(speedFadeOut);
            speedFadeOut.onEnd(getStopHandler(t, songText));
        }
        
        fadeIn.offset = l[0];
        fadeIn.deltaOffset = fadeIn.offset - previousOffset;
        previousOffset = fadeIn.offset;
        playList.push(fadeIn);
        
        t.setAttribute('y', (-100 + Math.random()*200));
        t.setAttribute("transform", "scale(0.2,0.2)")
    }

    for (i = 0; i < song.beats.length; i++) {
        beatPos.push({
            x: 700 * (Math.random() - 0.5),
            y: 500 * (Math.random() - 0.5)
        });
    }

    for (i = 0; i < beatListSize; i++) {
        var beat = sw.loadContent.call(null, {
            tag: "g",
            opacity: 0.25,
            children: [
                {
                    tag: "circle",
                    r: 5,
                    fill: "none",
                    "stroke-width": 3
                },
                {
                    tag: "circle",
                    r: 8,
                    fill: "none",
                    "stroke-width": 2
                },
                {
                    tag: "circle",
                    r: 12,
                    fill: "none",
                    "stroke-width": 4
                }
            ]
        });

        startBeat = new Animate(beat, {
            txf: {
                from: {sx: 1, sy: 1},
                to: {sx: 2, sy: 2},
                template: "scale(#sx, #sy)"
            }
        }, 0.75, yui.util.Easing.elasticOut);

        beatList.push(startBeat);
        startBeat.onBegin(getStartHandler(beat, beats));
        startBeat.onEnd(getStopHandler(beat, beats));
    }

    //buildAttributions();

    function getStartHandler(t, c) {
        return function () {
            c.appendChild(t);
        };
    }

    function getStopHandler(t, c) {
        return function () {
            c.removeChild(t);
        };
    }

    function getSpeedFadeOutHandler(previousFadeOut, 
                                    previousSpeedFadeOut,
                                    previousFadeIn) {
        return function () {
            // Check if the previousFadeIn is still running
            if (previousFadeIn.isAnimated()) {
                previousFadeIn.stop();
                previousSpeedFadeOut.animate();
            } else if (previousFadeOut.isAnimated()) {
                previousFadeOut.stop();
                previousSpeedFadeOut.animate();
            }
        }
    }


    function computeOffset (offset) {
        var seconds = secondsRegxp.exec(offset);
        var minutes;
        var s, m;
        if (seconds !== null) {
            s = seconds[1];
            return parseFloat(s);            
        } else {
            minutes = minutesRegxp.exec(offset);
            if (minutes !== null) {
                m = minutes[1];
                s = minutes[2];
                return 60 * parseFloat(m) + parseFloat(s);
            } else {
                throw new Error("Invalid offset value : " + offset);
            }
        }
    }

    function getBeatStartHandler (beatIndex) {
        var beatListIndex = beatIndex % beatList.length;
        var beat = beatList[beatListIndex];
        var scale = 2 + 5 * Math.random();
        return function () {
            beat.stop();
            beat.attributes.txf.to.sx = scale;
            beat.attributes.txf.to.sy = scale;
            beat.getEl().setAttribute("transform",
                "translate(" + beatPos[beatIndex].x +
                    "," + beatPos[beatIndex].y + ")");
            beat.attributes.txf.template = "translate(" + beatPos[beatIndex].x + "," +
                                  beatPos[beatIndex].y + ") scale(#sx,#sy)";
            beat.animate();
        }
    }

    function checkStartBeat () {
        if (nextBeat === -1) {
            return;
        }

        var curOffset = (new Date()).getTime() - startTime;
        var nextBeatOffset = song.beats[nextBeat];
        nextBeatOffset += song.timingOffset;
        if (curOffset >= nextBeatOffset) {
            var startHandler = getBeatStartHandler(nextBeat);
            startHandler();

            nextBeat++;
            if (nextBeat >= song.beats.length) {
                nextBeat = -1;
                //showCast.animate();
            }
        }
    }
    function play () {
        if (playing === false) {
            playing = true;
            startTime = (new Date()).getTime();
            nextBeat = 0;
            for (var i = 0; i < playList.length; i++) {
                setTimeout(getPlayLine(i),
                           Math.max(playList[i].offset + song.timingOffset, 1));
            }


            // Now start the audio track
            getAudio().play();
        } else {
            playing = false;
            getAudio().pause();
        }
    }

    function getAudio () {
        return document.getElementById("trackHTML5");
    }

    function getPlayLine (lineIndex) {
        var line = playList[lineIndex];
        return function () {
            line.animate();
            if (lineIndex === playList.length - 1) {
                playing = false;
            }
        }
    }

    function buildAttributions () {
        var attributions = song.attributions;
        var attributionLines;
        var attributionsGroup = $("attributionsGroup");
        var curLine = -0.5;
        var curGroup;
        var prevFadeOut;
        var firstFadeIn;
        var fadeIn;
        var fadeOut;
        var show;
        var lastFadeOut;

        for (var p in attributions) {
            if (attributions.hasOwnProperty(p) === true) {
                attributionLines = attributions[p].split("\n");
                curGroup = attributionsGroup.loadContent({
                    tag: "g"
                });

                curGroup.loadContent({
                    tag: "text",
                    "class": "attributionType",
                    y: (curLine++ * 1.1) + "em",
                    children: [p]
                });
                
                for (var i = 0; i < attributionLines.length; i++) {
                    curGroup.loadContent({
                        tag: "text",
                        "class": "attributionValue",
                        y: (curLine++ * 1.1) + "em",
                        children: [attributionLines[i]]
                    });
                }

                fadeIn = new Animate(attributionsGroup, {
                    txf: {
                        template: "scale(1, #sy)",
                        from: {sy: 0.01},
                        to: {sy: 1}
                    }
                }, 2, yui.util.Easing.elasticOut);

                show = new Animate(attributionsGroup, {
                    txf: {
                        from: {sy: 1},
                        to: {sy: 1},
                        template: "scale(1, 1)"
                    }
                }, 1, undefined);

                fadeOut = new Animate(attributionsGroup, {
                    txf: {
                        from: {sy: 1},
                        tp: {sy: 0.01},
                        template: "scale(1, #sy)"
                    }
                }, 0.25, yui.util.Easing.backIn);

                fadeIn.onBegin(curGroup.getShowHandler());
                fadeIn.onEnd(show);
                show.onEnd(fadeOut);
                fadeOut.onEnd(curGroup.getHideHandler());
                lastFadeOut = fadeOut;
                
                if (firstFadeIn === undefined) {
                    firstFadeIn = fadeIn;
                } else {
                    prevFadeOut.onEnd(fadeIn);
                }

                prevFadeOut = fadeOut;
                curLine = -0.5;
            }
        }

        lastFadeOut.onEnd(attributionsGroup.getHideHandler());

        // Add a background rectangle
        var bbox = attributionsGroup.getBBox();
        var firstChild = attributionsGroup.firstElementChild;
        var padding = 10;
        var bkg = attributionsGroup.loadContent({
            tag: "rect",
            x: -150,
            y: bbox.y - padding,
            width: 300,
            height: bbox.height + 2 * padding,
            fill: "url(#attributionsFill)",
            "fill-opacity": 0.5,
            stroke: "url(#attributionsStroke)",
            "stroke-opacity": 0.5,
            "stroke-width": 1,
            rx: 5,
            ry: 5,
            display: "none"
        }, firstChild);

        var c = firstChild;
        while (c !== null) {
            c.setAttribute("display", "none");
            c = c.nextElementSibling;
        }

        firstFadeIn.onBegin(bkg.getShowHandler());
        attributionsAnim = firstFadeIn;
    }
/*

    yui.util.Event.addListener("credits", "click", play);

    var showCredits = new Animate("credits", {
            txf: {
                to: {ty: 250, r: 0},
                from: {r: 180},
                template: 'translate(400,#ty) rotate(#r)'
            }
        }, 1.2, yui.util.Easing.elasticOut);
    var showCredits2 = new Animate("credits2", {
            txf: {
                to: {ty: 320, r: 0},
                from: {r: -180},
                template: 'translate(400,#ty) rotate(#r)'
            }
        }, 1, yui.util.Easing.elasticOut);
    var start = showCredits.getStartHandler();

*/
    var started = false;

    yui.util.Event.addListener(document, "click", function () {
            if (startTime === undefined) {
                startTime = (new Date()).getTime();
                play();
            } else {
                console.log((new Date()).getTime() - startTime);
            }
    });

/*    showCredits.onBegin(showCredits2);
    
    var hideCredits = new Animate("credits", {
            txf: {
                to: {ty: 600},
                template: 'translate(400,#ty)'
            }
        }, 0.6, yui.util.Easing.backIn);
    var hideCredits2 = new Animate("credits2", {
            txf: {
                to: {ty: 600},
                template: 'translate(400,#ty)'
            }
        }, 0.5, yui.util.Easing.backIn);

    var hideCast = new Animate("cast", {
        "fill-opacity": {
            from: 0.75,
            to: 0
        },
        "opacity": {
            from: 0.75,
            to: 0
        }
    }, 3);

    var showCast = new Animate("cast", {
        "fill-opacity": {from: 0, to: 0.75},
        opacity: {from: 0, to: 0.75}}, 3);

    hideCredits.onBegin(hideCredits2);
    hideCredits.onBegin(hideCast);
    showCast.onBegin(attributionsAnim);
    showCast.onBegin($("cast").getShowHandler());
    hideCast.onEnd($("cast").getHideHandler());
*/
}

// Wait for the audio to be ready before allowing the demo to start.
// =============================================================================

function onAudioReady () {
/*    animateLoadingAudio.stop();
    audioLoaded = true;
    $('instructions').setAttribute("display", "inline");*/

}

function initLoadingAudio () {
    /*hideLoadingAudio =
        new sw.animation.Animate("loadingAudioMessage", {
            opacity: {
                to: 0
            }
        },
        0.25);

    showInstructions =
        new sw.animation.Animate("instructions", {
            opacity: {
                to: 1
            }
        },
        0.25);

    animateLoadingAudio =
        new sw.animation.Animate("loadingAudio", {
            txf: {
                from: {r: 0},
                to: {r: 360},
                template: "rotate(#r)"
            }
        },
        2, undefined, "rotate(#r)");

    animateLoadingAudio.animate();

    animateLoadingAudio.onEnd(function () {
        if (audioLoaded === false) {
            animateLoadingAudio.animate();
        }
    });
*/
}

// Safari 5 Work around alert
// =============================================================================
// Work around issue in Safari 5 where an image in a pattern does not update
// the pattern after it is loaded. So if the image is not in the cache, the
// pattern does not display and is incomplete.

// The following event handler gets called when the background rectangle has 
// loaded and is ready to be updated.
// =============================================================================
function onBackgroundLoad() {
    var backgroundImage = new Image();

    backgroundImage.onload = function (evt) {
        var imagePattern = $('imagePattern');
        var c = imagePattern.lastChild;
        while (c !== null) {
            imagePattern.removeChild(c);
            c = imagePattern.lastChild;
        }
        imagePattern.loadContent({
            tag: "image",
            "xlink:href": "background.png",
            width: 800,
            height: 550
        });
        $('bgFill').setAttribute("fill", "url(#imagePattern)");
    };

    backgroundImage.src = "background.png";
}
