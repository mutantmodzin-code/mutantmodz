/**
 * Advanced Security Script to discourage console inspection and protect code.
 * Note: Client-side protection is never 100% foolproof but can discourage most users.
 */

export const initializeSecurity = () => {
  if (typeof window === 'undefined') return;

  // 1. Disable Context Menu (Right Click)
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
  });

  // 2. Disable Common Developer Tool Keyboard Shortcuts
  document.addEventListener('keydown', (e) => {
    // Disable F12
    if (e.key === 'F12') {
      e.preventDefault();
    }
    // Disable Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
    if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) {
      e.preventDefault();
    }
    // Disable Ctrl+U (View Source)
    if (e.ctrlKey && e.key === 'u') {
      e.preventDefault();
    }
  });

  // 3. Console Override & Protection
  // This effectively hides all logs and prevents normal console usage
  const noOp = () => {};
  const methods: (keyof Console)[] = ['log', 'debug', 'info', 'warn', 'error', 'table', 'clear'];
  
  methods.forEach((method) => {
    if (typeof console[method] === 'function') {
      (console as any)[method] = noOp;
    }
  });

  // Periodically clear the console just in case
  setInterval(() => {
    console.clear();
  }, 1000);

  // 4. Anti-Debugger Loop
  // This triggers a debugger pause if the developer tools are open,
  // making it extremely annoying or impossible to navigate the code.
  const antiDebugger = function() {
    try {
      (function(a: any) {
        if (
          (function() {
            return true;
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

  // Run the anti-debugger periodically
  setInterval(antiDebugger, 100);
};
