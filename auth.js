function requireRole(role) {
  const session = JSON.parse(sessionStorage.getItem('railwatch_session') || 'null');
  if (!session || session.role !== role) {
    window.location.replace('signin.html');
  }
}

function signOut() {
  sessionStorage.removeItem('railwatch_session');
  window.location.href = 'signin.html';
}
