// Roots Livestock — Philippine mobile number helpers (+63 9xx xxx xxxx)

const PH_MOBILE_PREFIX = '+63 ';

function isPhilippinePhoneField(el) {
  return el?.dataset?.phPhone === 'true';
}

/** Pre-fill +63 on phone-only fields (not login — that field allows email/username). */
function initPhilippinePhoneField(el) {
  if (!el || !isPhilippinePhoneField(el)) return;
  const trimmed = el.value.trim();
  if (!trimmed || trimmed === '+63' || trimmed === '+6' || trimmed === '+') {
    el.value = PH_MOBILE_PREFIX;
  } else {
    formatPhilippineMobileInput(el);
  }
}

function ensurePhilippinePhonePrefix(el) {
  if (!el || !isPhilippinePhoneField(el)) return;
  const trimmed = el.value.trim();
  if (!trimmed || trimmed === '+63' || trimmed === '+6' || trimmed === '+' || !trimmed.startsWith('+63')) {
    if (!normalizePhilippineMobileDigits(el.value)) {
      el.value = PH_MOBILE_PREFIX;
    } else {
      formatPhilippineMobileInput(el);
    }
  }
}

/** Strip to digits only after removing country/local prefixes. */function normalizePhilippineMobileDigits(input) {
  if (!input) return '';
  let s = String(input).trim().replace(/[\s\-().]/g, '');
  if (s.startsWith('+63')) s = s.slice(3);
  else if (s.startsWith('63')) s = s.slice(2);
  else if (s.startsWith('0')) s = s.slice(1);
  return s.replace(/\D/g, '');
}

/** Valid PH mobile: 10 digits starting with 9 (prefix + 7 local digits). */
function isValidPhilippineMobile(input) {
  const digits = normalizePhilippineMobileDigits(input);
  return /^9\d{9}$/.test(digits);
}

/** Display format: +63 917 555 0123 */
function formatPhilippineMobile(input) {
  const digits = normalizePhilippineMobileDigits(input);
  if (!/^9\d{9}$/.test(digits)) return null;
  return `+63 ${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
}

function looksLikePhilippinePhone(input) {
  const s = String(input || '').trim();
  if (!s || s.includes('@')) return false;
  const compact = s.replace(/[\s\-().]/g, '');
  if (/^(\+63|63|0)?9/.test(compact)) return true;
  const digitCount = s.replace(/\D/g, '').length;
  return digitCount >= 7 && /^[\d+\s\-().+]+$/.test(s);
}

function looksLikeEmail(input) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(input || '').trim());
}

function validateLoginIdentity(input) {
  const raw = String(input || '').trim();
  if (!raw) return { ok: false, message: 'Enter your phone, email, or username' };

  if (raw.includes('@')) {
    if (!looksLikeEmail(raw)) return { ok: false, message: 'Enter a valid email address' };
    return { ok: true, type: 'email', value: raw };
  }

  if (looksLikePhilippinePhone(raw)) {
    if (!isValidPhilippineMobile(raw)) {
      return {
        ok: false,
        message: 'Use Philippine mobile format: +63 9xx xxx xxxx (e.g. +63 917 555 0123)'
      };
    }
    return { ok: true, type: 'phone', value: formatPhilippineMobile(raw) };
  }

  if (raw.length < 3) {
    return { ok: false, message: 'Username must be at least 3 characters' };
  }
  return { ok: true, type: 'username', value: raw };
}

function validatePhilippinePhoneRequired(input, label) {
  const raw = String(input || '').trim();
  const field = label || 'phone number';
  const digits = normalizePhilippineMobileDigits(raw);
  if (!digits) return { ok: false, message: `Enter your ${field}` };
  if (!isValidPhilippineMobile(raw)) {
    return {
      ok: false,
      message: `Use Philippine mobile format: +63 9xx xxx xxxx (e.g. +63 917 555 0123)`
    };
  }
  return { ok: true, value: formatPhilippineMobile(raw) };
}

/** Format input while typing (phone-only fields keep +63 prefix). */
function formatPhilippineMobileInput(el) {
  if (!el) return;
  const digits = normalizePhilippineMobileDigits(el.value);
  if (!digits) {
    el.value = isPhilippinePhoneField(el) ? PH_MOBILE_PREFIX : '';
    return;
  }
  const limited = digits.slice(0, 10);
  if (limited.length <= 3) {
    el.value = `+63 ${limited}`;
  } else if (limited.length <= 6) {
    el.value = `+63 ${limited.slice(0, 3)} ${limited.slice(3)}`;
  } else {
    el.value = `+63 ${limited.slice(0, 3)} ${limited.slice(3, 6)} ${limited.slice(6)}`;
  }
}
