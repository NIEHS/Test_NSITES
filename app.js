const express = require('express');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 3000;

// Simple in-memory session (not for production)
app.use(session({
    secret: 'change_this_secret',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 60 * 60 * 1000 } // 1 hour
}));

app.use(express.urlencoded({ extended: true }));

// Hardcoded credentials for demo
const CREDENTIALS = { username: 'admin', password: 'password' };

function renderLogin(error = '') {
    return `
<!doctype html>
<html>
<head>
    <meta charset="utf-8">
    <title>Login</title>
    <style>
        body { font-family: Arial, sans-serif; display:flex; align-items:center; justify-content:center; height:100vh; margin:0; background:#f5f5f5; }
        .card { background:#fff; padding:24px; box-shadow:0 2px 8px rgba(0,0,0,0.1); border-radius:6px; width:320px; }
        input { width:100%; padding:8px; margin:8px 0; box-sizing:border-box; }
        button { width:100%; padding:10px; }
        .error { color:#c00; font-size:0.9rem; }
    </style>
</head>
<body>
    <div class="card">
        <h2>Sign in</h2>
        ${error ? `<div class="error">${error}</div>` : ''}
        <form method="POST" action="/login">
            <label>
                Username
                <input name="username" required autofocus />
            </label>
            <label>
                Password
                <input name="password" type="password" required />
            </label>
            <button type="submit">Login</button>
        </form>
    </div>
</body>
</html>
`;
}

function renderProtected(username) {
    return `
<!doctype html>
<html>
<head>
    <meta charset="utf-8">
    <title>Protected</title>
    <style>
        body { font-family: Arial, sans-serif; padding:40px; background:#f0f4f8; }
        .box { background:#fff; padding:24px; border-radius:6px; box-shadow:0 2px 8px rgba(0,0,0,0.08); max-width:600px; margin:auto; }
        a { color:#0366d6; }
    </style>
</head>
<body>
    <div class="box">
        <h1>Welcome, ${username}!</h1>
        <p>This is a simple protected page.</p>
        <p><a href="/logout">Sign out</a></p>
    </div>
</body>
</html>
`;
}

app.get('/', (req, res) => {
    if (req.session.user) return res.redirect('/protected');
    res.send(renderLogin());
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (username === CREDENTIALS.username && password === CREDENTIALS.password) {
        req.session.user = { username };
        return res.redirect('/protected');
    }
    res.send(renderLogin('Invalid username or password.'));
});

app.get('/protected', (req, res) => {
    if (!req.session.user) return res.redirect('/');
    res.send(renderProtected(req.session.user.username));
});

app.get('/logout', (req, res) => {
    req.session.destroy(() => res.redirect('/'));
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});