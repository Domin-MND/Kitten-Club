const express = require('express'),
      app = express(),
      fs = require('fs'),
      limiter = require('express-rate-limit')({ windowMs: 60 * 1000, max: 250, standardHeaders: true, legacyHeaders: false }),
      path = require('path'),
      PORT = process.env.SERVER_PORT || 3000;

// Middleware.
app.use(limiter);
app.use(require('compression')());
app.use(require('serve-favicon')(__dirname + '/public/kitten.ico'));
app.use(express.static(path.join(__dirname, "public"), { maxAge: 60 * 60 * 24 * 365.24 * 1000 }));
app.set('trust proxy', 1);
app.set('view engine', 'ejs');

// API returning random kitten picture
app.get('/api', (req, res) => {
    let url = req.url;
    const directory = __dirname + '/public/content/kitten';
    fs.readdir(directory, (err, files) => {
        if (err) console.log(console.log('ERR: ', err));
        let image = files[Math.floor(Math.random() * files.length)];
        res.send({
            image: 'http://kitten.only-fans.club/content/kitten/' + image
        });
    });
});

// Redirect to /
// Each request reads /public/content/kitten
app.get('*', (req, res) => {
    let url = req.url;
    const directory = __dirname + '/public/content/kitten';
    if (url != '/') return res.redirect('/');
    fs.readdir(directory, (err, files) => {
        let converted = '';
        if (err) console.log(console.log('ERR: ', err));
        let count = 0;
        files = files.map(function (fileName) {
            return {
                name: fileName,
                time: fs.statSync(directory + '/' + fileName).mtime.getTime()
            };
        })
        .sort(function (a, b) {
            return a.time - b.time;
        })
        .map(function (v) {
            return v.name;
        })
        .reverse() // Sort by descending date
        .forEach(file => {
            count++;
            let link = `./content/kitten/${file}`
            if (path.extname(file) == '.mp4') return converted += `<video id="${count}" src="${link}" controls></video>`
            converted += `<a href="${link}" target=”_blank”><img id="${count}" src="${link}"></a>`;
        });
        res.status(200).render(__dirname + '/views/kitten', {content:converted});
    });
});

// Starting the web.
// If DBH port is present, returns the port if not, returns 8080.
app.listen(PORT, () => {
    console.clear();
    console.log(PORT);
});