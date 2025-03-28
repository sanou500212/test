const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

const ZIP_URL = 'https://drive.google.com/uc?export=download&id=1bt1UjMLgHvEbqr6ikd_O23gYetYEIwDQ';
const ZIP_PATH = path.join(__dirname, 'site.zip');

app.post('/deploy', async (req, res) => {
    const { netlifyToken } = req.body;

    if (!netlifyToken) {
        return res.status(400).json({ message: 'Jeton Netlify requis.' });
    }

    try {
        console.log('⏳ Téléchargement du fichier ZIP...');
        const zipResponse = await axios.get(ZIP_URL, { responseType: 'arraybuffer' });
        fs.writeFileSync(ZIP_PATH, zipResponse.data);
        console.log('✅ Fichier ZIP téléchargé.');

        console.log('⏳ Déploiement en cours sur Netlify...');
        const netlifyResponse = await axios.post(
            'https://api.netlify.com/api/v1/sites',
            fs.readFileSync(ZIP_PATH),
            {
                headers: {
                    Authorization: `Bearer ${netlifyToken}`,
                    'Content-Type': 'application/zip'
                }
            }
        );

        console.log('✅ Déploiement réussi :', netlifyResponse.data.url);
        res.json({ url: netlifyResponse.data.url });

    } catch (error) {
        console.error('❌ Erreur :', error.response?.data || error.message);
        res.status(500).json({ message: 'Échec du déploiement.' });
    }
});

app.listen(3000, () => console.log('🚀 Serveur prêt sur le port 3000'));
