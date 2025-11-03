function initAuth() {
    document.getElementById('authForm').addEventListener('submit', function(e) {
        e.preventDefault();
        login();
    });

    document.getElementById('registerFormElement').addEventListener('submit', function(e) {
        e.preventDefault();
        register();
    });

    showAuthModal();
}

function showAuthModal() {
    document.getElementById('authModal').style.display = 'block';
    document.getElementById('mainApp').style.display = 'none';
}

function closeAuthModal() {
    document.getElementById('authModal').style.display = 'none';
}

function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (!username || !password) {
        notificationManager.warning('Введите логин и пароль');
        return;
    }

    const testUsers = {
        'admin': { password: 'admin123', name: 'Администратор' },
        'user': { password: 'user123', name: 'Иван Иванов' }
    };

    if (testUsers[username] && testUsers[username].password === password) {
        currentUser = {
            username: username,
            name: testUsers[username].name
        };
        
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        showMainApp();
        notificationManager.success(`Добро пожаловать, ${currentUser.name}!`);
    } else {
        notificationManager.error('Неверный логин или пароль');
    }
}

function register() {
    const username = document.getElementById('regUsername').value;
    const password = document.getElementById('regPassword').value;
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;

    if (!username || !password || !name) {
        notificationManager.warning('Заполните обязательные поля');
        return;
    }

    if (username.length < 3) {
        notificationManager.warning('Логин должен быть не менее 3 символов');
        return;
    }

    if (password.length < 6) {
        notificationManager.warning('Пароль должен быть не менее 6 символов');
        return;
    }

    currentUser = {
        username: username,
        name: name,
        email: email
    };
    
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    notificationManager.success('Регистрация успешна!');
    showMainApp();
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    showAuthModal();
    notificationManager.info('Вы вышли из системы');
}

function showRegisterForm() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
}

function showLoginForm() {
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('loginForm').style.display = 'block';
}

