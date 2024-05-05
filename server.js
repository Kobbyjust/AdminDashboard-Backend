const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const properties = require('./propertiesData');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

// Serve static files from the 'frontend' directory
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// Routes
app.get('/', (req, res) => {
    res.redirect('/login');
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'login.html'));
});

app.post('/login', (req, res) => {
    res.redirect('/index.html');
});

app.get('/profile', (req, res) => {
    res.send('Welcome to the profile page');
});

app.get('/logout', (req, res) => {
    res.redirect('/');
});

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
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

// app.get('/property-details.html', (req, res) => {
//     // Read the contents of the HTML file
//     fs.readFile(path.join(__dirname, '..', 'frontend', 'property-details.html'), 'utf8', (err, data) => {
//         if (err) {
//             // If there's an error reading the file, send a 500 error response
//             console.error('Error reading file:', err);
//             res.status(500).send('Internal Server Error');
//         } else {
//             // If the file is successfully read, send its contents as the response
//             res.send(data);
//         }
//     });
// });

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
