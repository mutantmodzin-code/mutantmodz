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
27:   // 3. Console Override & Protection
28:   const noOp = () => {};
29:   const methods = ['log', 'debug', 'info', 'warn', 'error', 'table', 'clear'];
30:   
31:   methods.forEach((method) => {
32:     if (typeof console[method] === 'function') {
33:       console[method] = noOp;
34:     }
35:   });
36: 
37:   // Periodically clear the console
38:   setInterval(() => {
39:     console.clear();
40:   }, 1000);
41:   */

  /*
42:   // 4. Anti-Debugger Loop
43:   const antiDebugger = function() {
44:     try {
45:       (function(a) {
46:         if (
47:           (function() {
48:             return !!([]);
49:           }
50:           .constructor("return  /\\w+/.test(" + a.toString() + ")")
51:           .call(false))
52:         ) {
53:           return true;
54:         } else {
55:           return false;
56:         }
57:       }
58:       .constructor("debugger")
59:       .call("action"));
60:     } catch (e) {}
61:   };
62: 
63:   setInterval(antiDebugger, 100);
64:   */
};
