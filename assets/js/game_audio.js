(function () {
    const STORAGE_KEY = 'game_sound_enabled';
    const SOUND_SOURCES = {
        click: ['../assets/sound/correct.mp3'],
        run: ['../assets/sound/correct.mp3'],
        crash: ['../assets/sound/wrong.mp3'],
        collect: ['../assets/sound/correct.mp3'],
        correct: ['../assets/sound/correct.mp3'],
        wrong: ['../assets/sound/wrong.mp3'],
        success: ['../assets/sound/correct.mp3'],
        victory: ['../assets/sound/correct.mp3'],
        move: ['../assets/sound/correct.mp3']
    };
    const VOLUMES = {
        click: 0.35,
        run: 0.45,
        crash: 0.65,
        collect: 0.6,
        correct: 0.6,
        wrong: 0.55,
        success: 0.7,
        victory: 0.8,
        move: 0.18
    };

    let enabled = readEnabled();
    let initialized = false;
    let sounds = {};

    function readEnabled() {
        try {
            return window.localStorage.getItem(STORAGE_KEY) !== 'false';
        } catch (error) {
            return true;
        }
    }

    function persistEnabled(value) {
        try {
            window.localStorage.setItem(STORAGE_KEY, value ? 'true' : 'false');
        } catch (error) {
            // Some browsers block storage in private modes. Sound still works for the current page.
        }
    }

    function hasHowler() {
        return typeof window.Howl !== 'undefined';
    }

    function syncHowlerMute() {
        if (typeof window.Howler !== 'undefined') {
            window.Howler.mute(!enabled);
        }
    }

    function init() {
        if (initialized) {
            syncHowlerMute();
            return hasHowler();
        }

        initialized = true;
        if (!hasHowler()) {
            return false;
        }

        Object.keys(SOUND_SOURCES).forEach((key) => {
            sounds[key] = new window.Howl({
                src: SOUND_SOURCES[key],
                volume: VOLUMES[key] || 0.6,
                preload: true
            });
        });
        syncHowlerMute();
        return true;
    }

    window.GameAudio = {
        init,

        play(key) {
            if (!enabled || !key) return false;
            init();

            const sound = sounds[key];
            if (!sound) return false;

            try {
                sound.stop();
                sound.play();
                return true;
            } catch (error) {
                console.warn('Unable to play sound:', key, error);
                return false;
            }
        },

        setEnabled(value) {
            enabled = !!value;
            persistEnabled(enabled);
            syncHowlerMute();
        },

        isEnabled() {
            return enabled;
        },

        toggle() {
            this.setEnabled(!enabled);
            return enabled;
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
        init();
    }
})();
