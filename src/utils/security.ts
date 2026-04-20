/**
 * Protection script to prevent inspection and console access.
 * Note: No frontend protection is 100% foolproof, but these measures
 * make it significantly harder for average users to inspect the code.
 */

export const initSecurity = () => {
    if (import.meta.env.MODE === 'development') {
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
    (window.console as any).log = noop;
    (window.console as any).info = noop;
    (window.console as any).warn = noop;
    (window.console as any).error = noop;
    (window.console as any).debug = noop;

    // 4. Debugger loop to pause execution if DevTools are open
    // This is a common technique to make debugging very difficult
    setInterval(() => {
        (function() {
            (function a() {
                try {
                    (function b(i: number) {
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
};
