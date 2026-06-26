// Client-side interaction metrics tracker to identify bot profiles

let mouseMoves = 0;
let scrollEvents = 0;
const keyboardTimings: number[] = [];
let lastKeyTime: number | null = null;
let pasteDetected = false;
let focusChanges = 0;
let isActive = true;

const handleMouseMove = () => {
    mouseMoves++;
};

const handleScroll = () => {
    scrollEvents++;
};

const handleKeyDown = () => {
    const now = performance.now();
    if (lastKeyTime !== null) {
        // Log difference between keystrokes to detect automation script regularity
        keyboardTimings.push(now - lastKeyTime);
    }
    lastKeyTime = now;
};

const handlePaste = () => {
    pasteDetected = true;
};

const handleFocus = () => {
    focusChanges++;
    isActive = true;
};

const handleBlur = () => {
    isActive = false;
};

/**
 * Attaches event listeners to capture telemetry inputs.
 */
export const startBehavioralTracking = () => {
    mouseMoves = 0;
    scrollEvents = 0;
    keyboardTimings.length = 0;
    lastKeyTime = null;
    pasteDetected = false;
    focusChanges = 0;
    isActive = true;

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('keydown', handleKeyDown, { passive: true });
    window.addEventListener('paste', handlePaste, { passive: true });
    window.addEventListener('focus', handleFocus, { passive: true });
    window.addEventListener('blur', handleBlur, { passive: true });
};

/**
 * Detaches event listeners once login completes or page changes.
 */
export const stopBehavioralTracking = () => {
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('scroll', handleScroll);
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('paste', handlePaste);
    window.removeEventListener('focus', handleFocus);
    window.removeEventListener('blur', handleBlur);
};

/**
 * Returns the aggregated interaction profile report
 */
export const getBehavioralProfile = () => {
    return {
        mouseMoves,
        scrollEvents,
        keyboardTimings: keyboardTimings.slice(-30), // Submit a representative subset of timings
        pasteDetected,
        focusChanges,
        isActive
    };
};
