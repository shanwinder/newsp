(function () {
    function hasGsap() {
        return typeof window.gsap !== 'undefined';
    }

    window.GameMotion = {
        missionEnter() {
            if (!hasGsap()) return;

            window.gsap.from('.sequence-mission', {
                y: -18,
                opacity: 0,
                duration: 0.35,
                ease: 'back.out(1.5)'
            });
        },

        commandAdded(el) {
            if (!hasGsap() || !el) return;

            window.gsap.from(el, {
                scale: 0,
                y: -8,
                duration: 0.22,
                ease: 'back.out(2)'
            });
        },

        feedback(type = 'info') {
            if (!hasGsap()) return;

            const box = document.getElementById('feedback-box');
            if (!box) return;

            if (type === 'error' || type === 'danger') {
                window.gsap.fromTo(
                    box,
                    { x: -8 },
                    {
                        x: 8,
                        duration: 0.06,
                        repeat: 5,
                        yoyo: true,
                        clearProps: 'x'
                    }
                );
                return;
            }

            window.gsap.fromTo(
                box,
                { scale: 0.96, opacity: 0.6 },
                {
                    scale: 1,
                    opacity: 1,
                    duration: 0.24,
                    ease: 'back.out(1.7)'
                }
            );
        },

        badgeUpdate() {
            if (!hasGsap()) return;

            const badge = document.getElementById('attempt-badge');
            if (!badge) return;

            window.gsap.fromTo(
                badge,
                { scale: 1.12 },
                { scale: 1, duration: 0.18, ease: 'power2.out' }
            );
        },

        completionHero() {
            if (!hasGsap()) return;

            window.gsap.from('.completion-hero', {
                y: -28,
                opacity: 0,
                duration: 0.5,
                ease: 'back.out(1.6)'
            });
        },

        stickyCta() {
            if (!hasGsap()) return;

            window.gsap.from('.project-sticky-cta', {
                y: 70,
                opacity: 0,
                duration: 0.4,
                ease: 'power3.out'
            });
        },

        resultStars() {
            if (!hasGsap()) return;

            window.gsap.from('.result-star', {
                scale: 0,
                rotation: -20,
                duration: 0.28,
                stagger: 0.12,
                ease: 'back.out(2)'
            });
        }
    };
})();
