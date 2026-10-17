'use client';

import React, { useEffect, useRef, useState } from 'react';

const GOOGLE_RECAPTCHA_DEFAULT_KEY =
  process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ||
  '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI';

export default function CheckoutRecaptcha({ verified = false, onVerify }) {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    const SCRIPT_ID = 'google-recaptcha-v2-script';
    let script = document.getElementById(SCRIPT_ID);

    const checkGrecaptcha = () => {
      if (window.grecaptcha && window.grecaptcha.render) {
        setScriptLoaded(true);
        return true;
      }
      return false;
    };

    if (checkGrecaptcha()) return;

    if (!script) {
      script = document.createElement('script');
      script.id = SCRIPT_ID;
      script.src = 'https://www.google.com/recaptcha/api.js?render=explicit';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if (window.grecaptcha && window.grecaptcha.ready) {
          window.grecaptcha.ready(() => setScriptLoaded(true));
        } else {
          setScriptLoaded(true);
        }
      };
      document.body.appendChild(script);
    } else {
      const interval = setInterval(() => {
        if (checkGrecaptcha()) {
          clearInterval(interval);
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, []);

  useEffect(() => {
    if (!scriptLoaded || !containerRef.current) return;

    if (window.grecaptcha && typeof window.grecaptcha.render === 'function') {
      try {
        if (widgetIdRef.current === null && containerRef.current.children.length === 0) {
          widgetIdRef.current = window.grecaptcha.render(containerRef.current, {
            sitekey: GOOGLE_RECAPTCHA_DEFAULT_KEY,
            callback: (token) => {
              if (onVerify) onVerify(true, token);
            },
            'expired-callback': () => {
              if (onVerify) onVerify(false, null);
            },
            'error-callback': () => {
              if (onVerify) onVerify(false, null);
            },
          });
        }
      } catch (err) {
        console.warn('[Google reCAPTCHA] render error:', err);
      }
    }
  }, [scriptLoaded, onVerify]);

  return (
    <div className="mb-3.5 flex justify-center sm:justify-start overflow-hidden">
      <div ref={containerRef} className="min-h-[78px]" />
    </div>
  );
}
