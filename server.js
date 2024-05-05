const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const properties = require('./propertiesData');
const users = require('./users');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(session({ secret: process.env.SESSION_SECRET || 'secret', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

// Serve static files from the 'frontend' directory
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// Configure passport
passport.use(new LocalStrategy(
    (username, password, done) => {
        const user = users.find(u => u.username === username);
        if (!user) return done(null, false, { message: 'Incorrect username' });
        bcrypt.compare(password, user.password, (err, result) => {
            if (err) return done(err);
            if (!result) return done(null, false, { message: 'Incorrect password' });
            return done(null, user);
        });
    }
));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    const user = users.find(u => u.id === id);
    done(null, user);
});

// Routes
app.get('/', (req, res) => {
    res.redirect('/login');
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'login.html'));
});

app.post('/login', passport.authenticate('local', { failureRedirect: '/login' }), (req, res) => {
    res.redirect('/index.html');
});

app.get('/profile', isAuthenticated, (req, res) => {
    res.send(`Welcome ${req.user.name}`);
});

app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

// Authentication middleware
function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}

// Routes for property management
app.get('/properties', (req, res) => {
    res.json(properties);
});

app.get('/properties/:propertyId', (req, res) => {
    const propertyId = req.params.propertyId;
    const property = properties.find(property => property.id === parseInt(propertyId));
    if (property) {
        res.json(property);
    } else {
        res.status(404).json({ message: "Property not found" });
    }
});

app.post('/properties', (req, res) => {
    const property = req.body;
    properties.push(property);
    res.status(201).json(property);
});

app.put('/properties/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const updatedProperty = req.body;
    const index = properties.findIndex(property => property.id === id);
    if (index !== -1) {
        properties[index] = updatedProperty;
        res.json(updatedProperty);
    } else {
        res.status(404).json({ message: 'Property not found' });
    }
});

app.delete('/properties/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = properties.findIndex(property => property.id === id);
    if (index !== -1) {
        properties.splice(index, 1);
        res.json({ message: 'Property deleted successfully' });
    } else {
        res.status(404).json({ message: 'Property not found' });
    }
});

// Serve index.html as dashboard
app.get('/login', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});


app.get('/property-details.html', isAuthenticated, (req, res) => {
    // Read the contents of the HTML file
    fs.readFile(path.join(__dirname, '..', 'frontend', 'property-details.html'), 'utf8', (err, data) => {
        if (err) {
            // If there's an error reading the file, send a 500 error response
            console.error('Error reading file:', err);
            res.status(500).send('Internal Server Error');
        } else {
            // If the file is successfully read, send its contents as the response
            res.send(data);
        }
    });
});


// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
