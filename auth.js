function requireRole(role) {
  const session = getSession();
  if (!session || session.role !== role) {
    window.location.replace('signin.html');
  }
}

function getSession() {
  try {
    return JSON.parse(sessionStorage.getItem('railwatch_session') || 'null');
  } catch {
    return null;
  }
}

function updateAuthLinks() {
  if (!getSession()) return;

  document.querySelectorAll('.auth-link[href="signin.html"]').forEach(link => {
    link.textContent = '↪ Log Out';
    link.onclick = event => {
      event.preventDefault();
      signOut();
    };
  });
}

function signOut() {
  sessionStorage.removeItem('railwatch_session');
  window.location.href = 'signin.html';
}

document.addEventListener('DOMContentLoaded', updateAuthLinks);
