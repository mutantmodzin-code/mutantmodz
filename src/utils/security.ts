/**
 * Protection script to prevent inspection and console access.
 * Note: No frontend protection is 100% foolproof, but these measures
 * make it significantly harder for average users to inspect the code.
 */

export const initSecurity = () => {
    // Disable right-click
    document.addEventListener('contextmenu', (e) => e.preventDefault());

    // Disable keyboard shortcuts for DevTools
    document.addEventListener('keydown', (e) => {
        // F12
        if (e.keyCode === 123) {
            e.preventDefault();
            return false;
        }
        // Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
        if (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) {
            e.preventDefault();
            return false;
        }
        // Ctrl+U (View Source)
        if (e.ctrlKey && e.keyCode === 85) {
            e.preventDefault();
            return false;
        }
    });

    // Disable console in production
    if (import.meta.env.PROD) {
        const noop = () => {};
        console.log = noop;
        console.debug = noop;
        console.info = noop;
        console.warn = noop;
        console.error = noop;
        
        // Anti-debugging
        setInterval(() => {
            (function() {
                // This creates a debugger break if DevTools is open
                // but we use a try-catch to keep the app running
                try {
                    (function a() {
                        return (function b() {
                            return (function c() {
                                debugger;
                                return 'mutant';
                            })();
                        })();
                    })();
                } catch (e) {}
            })();
        }, 1000);
    }
};
