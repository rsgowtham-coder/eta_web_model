/* Demo-only credential registry. Use a backend and hashed passwords for production. */
window.railwatchUsers = [
  { email: 'sih@eta.com', password: '26028', role: 'admin' },
  { email: 'goldendawn@sih', password: 'sih2026', role: 'admin' },
  { email: 'operator@admin.eta.in', password: 'admin2026', role: 'admin' },
  { email: 'pilot@loco.eta.in', password: 'pilot2026', role: 'loco' }
];

window.getLoginUsers = function () {
  const storedUsers = localStorage.getItem('railwatch_login_users');
  if (!storedUsers) return window.railwatchUsers;

  try {
    const users = JSON.parse(storedUsers);
    return Array.isArray(users) ? users : window.railwatchUsers;
  } catch (error) {
    return window.railwatchUsers;
  }
};

window.saveLoginUsers = function (users) {
  localStorage.setItem('railwatch_login_users', JSON.stringify(users));
};
