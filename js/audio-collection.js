/** =======================================================================
 *  Vincent Hardy
 *  License terms: see svg-wow.org
 *  CC0 http://creativecommons.org/publicdomain/zero/1.0/
 *  ======================================================================= */

sw.audio = sw.audio || {};

/**
 * This class provides a simple interface to a collection of songs which can
 * then be managed by demos.
 */
sw.audio.Collection = function () {
    this.songs = [];
};

sw.audio.Collection.prototype = {
    constructor: sw.audio.Collection,

    /**
     * Appends a new audio to the collection
     *
     * @param p_song a new song to manage. It should have the following
     * properties: directory, formats, artist, album, song, released and
     * lyrics.
     */
    append : function (p_song) {
        this.songs.push(p_song);
    },

    /**
     * @return the list of songs.
     */
    getSongs : function () {
        return this.songs;
    },

    /**
     * Utility for creating the timing for a given song. Plays the song and
     * records 'enter' key presses to determine the timing of the lyrics lines
     *
     * @param p_songIndex the index of the song to time
     */
    buildTiming : function (p_songIndex) {
        var start = (new Date()).getTime();
        var song = this.songs[p_songIndex];
        var curLine = 0;

        document.documentElement.addEventListener("click", function () {
            var t = (new Date()).getTime() - start;
            console.log("[" + t + ", \"" + song.lyrics[curLine++] + "],");
        }, false);
    }
}

sw.audio.collection = new sw.audio.Collection();
