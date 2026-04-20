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

  /* Section 3 & 4 disabled to enable console for debugging
31:   // 3. Console Override & Protection
32:   // This effectively hides all logs and prevents normal console usage
33:   const noOp = () => {};
34:   const methods: (keyof Console)[] = ['log', 'debug', 'info', 'warn', 'error', 'table', 'clear'];
35:   
36:   methods.forEach((method) => {
37:     if (typeof console[method] === 'function') {
38:       (console as any)[method] = noOp;
39:     }
40:   });
41: 
42:   // Periodically clear the console just in case
43:   setInterval(() => {
44:     console.clear();
45:   }, 1000);
46:   */

  /*
50:   // 4. Anti-Debugger Loop
51:   // This triggers a debugger pause if the developer tools are open,
52:   // making it extremely annoying or impossible to navigate the code.
53:   const antiDebugger = function() {
54:     try {
55:       (function(a: any) {
56:         if (
57:           (function() {
58:             return true;
59:           }
60:           .constructor("return  /\\w+/.test(" + a.toString() + ")")
61:           .call(false))
62:         ) {
63:           return true;
64:         } else {
65:           return false;
66:         }
67:       }
68:       .constructor("debugger")
69:       .call("action"));
70:     } catch (e) {}
71:   };
72: 
73:   // Run the anti-debugger periodically
74:   setInterval(antiDebugger, 100);
75:   */
};
