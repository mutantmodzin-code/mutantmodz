/**
 * Advanced Security Script to discourage console inspection and protect code.
 */

export const initializeSecurity = () => {
  if (typeof window === 'undefined') return;

  // 1. Disable Context Menu (Right Click)
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
  });

  // 2. Disable Common Developer Tool Keyboard Shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.key === 'F12') {
      e.preventDefault();
    }
    if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) {
      e.preventDefault();
    }
    if (e.ctrlKey && e.key === 'u') {
      e.preventDefault();
    }
  });

  /* Section 3 & 4 disabled to enable console for debugging
  // 3. Console Override & Protection
  const noOp = () => {};
  const methods = ['log', 'debug', 'info', 'warn', 'error', 'table', 'clear'];
  
  methods.forEach((method) => {
    if (typeof console[method] === 'function') {
      console[method] = noOp;
    }
  });

  // Periodically clear the console
  setInterval(() => {
    console.clear();
  }, 1000);
  */

  /*
  // 4. Anti-Debugger Loop
  const antiDebugger = function() {
    try {
      (function(a) {
        if (
          (function() {
            return !!([]);
          }
          .constructor("return  /\\w+/.test(" + a.toString() + ")")
          .call(false))
        ) {
          return true;
        } else {
          return false;
        }
      }
      .constructor("debugger")
      .call("action"));
    } catch (e) {}
  };

  setInterval(antiDebugger, 100);
  */
};
