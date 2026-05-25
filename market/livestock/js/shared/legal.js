// Roots Livestock — Terms & Privacy modals

function openTermsModal(e) {
  if (e) { e.preventDefault(); e.stopPropagation(); }
  document.getElementById('privacyPolicyModal')?.classList.add('hidden');
  document.getElementById('termsModal')?.classList.remove('hidden');
}

function openPrivacyModal(e) {
  if (e) { e.preventDefault(); e.stopPropagation(); }
  document.getElementById('termsModal')?.classList.add('hidden');
  document.getElementById('privacyPolicyModal')?.classList.remove('hidden');
}

function closeLegalModals() {
  document.getElementById('termsModal')?.classList.add('hidden');
  document.getElementById('privacyPolicyModal')?.classList.add('hidden');
}
