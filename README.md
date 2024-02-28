# Email User Authentication

## 1. Manuel Way

```
const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const users = [];

// Kullanıcı kaydı
app.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Parolayı güvenli bir şekilde sakla
        const hashedPassword = await bcrypt.hash(password, 10);

        // Kullanıcıyı veritabanına ekle
        users.push({ email, password: hashedPassword });

        res.send('Kayıt başarılı.');
    } catch (error) {
        res.status(500).send('Kayıt sırasında bir hata oluştu.');
    }
});

// Kullanıcı girişi
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Kullanıcıyı bul
        const user = users.find(u => u.email === email);

        if (!user) {
            return res.status(401).send('Kullanıcı bulunamadı.');
        }

        // Parolayı kontrol et
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (passwordMatch) {
            res.send('Giriş başarılı.');
        } else {
            res.status(401).send('Parola doğru değil.');
        }
    } catch (error) {
        res.status(500).send('Giriş sırasında bir hata oluştu.');
    }
});

app.listen(port, () => {
    console.log(`Uygulama ${port} portunda çalışıyor.`);
});

```

## 2. Firebase Authentication
* Firebase Authentication, kullanıcı kimlik doğrulama işlevselliğini sağlayan bir hizmettir. Firebase kullanarak kolayca mail adresi ile giriş, sosyal medya ile giriş, telefon numarası ile giriş gibi yöntemleri entegre edebilirsiniz.
* Firebase ile sağlanan kolay entegrasyon, güvenlik ve ölçeklenebilirlik avantajlarından faydalanabilirsiniz.
* Başlangıç için hızlı ve kullanımı kolaydır.

```
npm install firebase
```
```
const express = require('express');
const bodyParser = require('body-parser');
const firebase = require('firebase');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Firebase yapılandırma bilgilerini buraya ekleyin
const firebaseConfig = {
  apiKey: 'your-api-key',
  authDomain: 'your-auth-domain',
  projectId: 'your-project-id',
};

firebase.initializeApp(firebaseConfig);

// Kullanıcı kaydı
app.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        await firebase.auth().createUserWithEmailAndPassword(email, password);
        res.send('Kayıt başarılı.');
    } catch (error) {
        res.status(500).send('Kayıt sırasında bir hata oluştu.');
    }
});

// Kullanıcı girişi
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        await firebase.auth().signInWithEmailAndPassword(email, password);
        res.send('Giriş başarılı.');
    } catch (error) {
        res.status(401).send('Kullanıcı bulunamadı veya parola hatalı.');
    }
});

app.listen(port, () => {
    console.log(`Uygulama ${port} portunda çalışıyor.`);
});

```

## 3. Passport.js
* Passport.js, Express tabanlı Node.js uygulamaları için hafif bir kimlik doğrulama kütüphanesidir.
* Çeşitli kimlik doğrulama stratejilerini destekler, böylece mail adresi ile giriş yanında sosyal medya entegrasyonları gibi çeşitli giriş yöntemlerini ekleyebilirsiniz.
* Daha özelleştirilebilir çözümler sunabilir.

```
npm install passport passport-local express-session
```
```
const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(require('express-session')({ secret: 'your-secret-key', resave: true, saveUninitialized: true }));

passport.use(new LocalStrategy(
    (username, password, done) => {
        // Kullanıcı doğrulama işlemini gerçekleştirin
        // Bu örnekte basitleştirilmiştir, gerçek projede veritabanı kullanılmalıdır
        if (username === 'user' && password === 'password') {
            return done(null, { id: 1, username: 'user' });
        } else {
            return done(null, false, { message: 'Kullanıcı adı veya parola hatalı.' });
        }
    }
));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => done(null, { id, username: 'user' }));

app.use(passport.initialize());
app.use(passport.session());

// Kullanıcı kaydı
app.post('/register', (req, res) => {
    res.send('Kayıt işlemi burada gerçekleştirilir.');
});

// Kullanıcı girişi
app.post('/login',
    passport.authenticate('local', { successRedirect: '/', failureRedirect: '/login', failureFlash: true }),
    (req, res) => res.send('Giriş başarılı.')
);

app.listen(port, () => {
    console.log(`Uygulama ${port} portunda çalışıyor.`);
});

```

## 4. Auth0
* Auth0, kimlik yönetimi ve kimlik doğrulama sağlayan bir servistir.
* Auth0 ile mail adresi ile giriş, sosyal medya ile giriş, çok faktörlü kimlik doğrulama gibi özellikleri kolayca ekleyebilirsiniz.
* Geniş kimlik yönetimi ile büyük projeler için uygundur.

```
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const Auth0Strategy = require('passport-auth0');

const app = express();
const port = 3000;

app.use(session({ secret: 'your-secret-key', resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

const strategy = new Auth0Strategy({
    domain: 'your-auth0-domain', // After creating a auth0 account
    clientID: 'your-client-id', // After creating a auth0 account
    clientSecret: 'your-client-secret', // After creating a auth0 account
    callbackURL: 'http://localhost:3000/callback'
}, (accessToken, refreshToken, extraParams, profile, done) => {
    return done(null, profile);
});

passport.use(strategy);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

app.get('/login',
    passport.authenticate('auth0', { scope: 'openid email profile' }),
    (req, res) => res.redirect('/')
);

app.get('/callback',
    passport.authenticate('auth0', { failureRedirect: '/' }),
    (req, res) => {
        res.redirect('/');
    }
);

app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

app.get('/', (req, res) => {
    res.send(req.isAuthenticated() ? 'Hoş geldiniz!' : 'Lütfen giriş yapın.');
});

app.listen(port, () => {
    console.log(`Uygulama ${port} portunda çalışıyor.`);
});

```