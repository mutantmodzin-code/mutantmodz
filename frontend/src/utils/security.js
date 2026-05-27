/**
 * Protection script to prevent inspection and console access.
 */

export const initSecurity = () => {
    // Console and DevTools enabled for admin and main
    /*
    // Check if we are in production
    const isProduction = import.meta.env.MODE === 'production';
    
    if (!isProduction) {
        return; // Don't disable in development
    }

    // 1. Disable right-click context menu
    document.addEventListener('contextmenu', (e) => e.preventDefault());

    // 2. Disable keyboard shortcuts for DevTools
    document.onkeydown = (e) => {
        // F12
        if (e.keyCode === 123) {
            return false;
        }
        // Ctrl+Shift+I
        if (e.ctrlKey && e.shiftKey && e.keyCode === 73) {
            return false;
        }
        // Ctrl+Shift+J
        if (e.ctrlKey && e.shiftKey && e.keyCode === 74) {
            return false;
        }
        // Ctrl+U (View Source)
        if (e.ctrlKey && e.keyCode === 85) {
            return false;
        }
        // Ctrl+S (Save Page)
        if (e.ctrlKey && e.keyCode === 83) {
            return false;
        }
    };

    // 3. Disable console logging
    const noop = () => {};
    window.console.log = noop;
    window.console.info = noop;
    window.console.warn = noop;
    window.console.error = noop;
    window.console.debug = noop;

    // 4. Debugger loop to pause execution if DevTools are open
    setInterval(() => {
        (function() {
            (function a() {
                try {
                    (function b(i) {
                        if (("" + i / i).length !== 1 || i % 20 === 0) {
                            (function() {}).constructor("debugger")();
                        } else {
                            debugger;
                        }
                        b(++i);
                    })(0);
                } catch (e) {}
            })();
        })();
    }, 1000);
    */
};
