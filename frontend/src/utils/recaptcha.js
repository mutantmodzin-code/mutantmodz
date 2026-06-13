export const loadRecaptchaV3 = (siteKey) => {
  return new Promise((resolve) => {
    if (window.grecaptcha && window.grecaptcha.execute) {
      resolve();
      return;
    }

    const scriptId = 'recaptcha-v3-script';
    let script = document.getElementById(scriptId);
    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    const checkLoaded = setInterval(() => {
      if (window.grecaptcha && window.grecaptcha.execute) {
        clearInterval(checkLoaded);
        resolve();
      }
    }, 100);
  });
};

export const executeRecaptchaV3 = async (siteKey, action) => {
  try {
    await loadRecaptchaV3(siteKey);
    return new Promise((resolve) => {
      window.grecaptcha.ready(async () => {
        try {
          const token = await window.grecaptcha.execute(siteKey, { action });
          resolve(token);
        } catch (err) {
          console.error('reCAPTCHA v3 execution failed:', err);
          resolve(null);
        }
      });
    });
  } catch (err) {
    console.error('reCAPTCHA v3 load failed:', err);
    return null;
  }
};
