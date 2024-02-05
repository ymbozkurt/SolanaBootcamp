const express = require('express');
const { exec } = require('child_process');
const bodyParser = require('body-parser');
var fs = require('fs');

const app = express();
var defaultPage = fs.readFileSync('index.html', 'utf8', (err, data) => {
            if(err){
                console.error(err)
                return
            }
        })
app.get('/', function(req, res){
    res.send(defaultPage)
});

app.post('/newwallet', (req, res) => {
    // Güvenlik önlemleri alınmalıdır! Kullanıcı tarafından sağlanan verilere güvenilmemelidir.
    const command = 'solana-keygen new --no-bip39-passphrase --force'; // Örnek bir terminal komutu

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Hata oluştu: ${error.message}`);
            res.status(500).send('İşlem sırasında hata oluştu.');
            console.error(`Hata çıktısı: ${stderr}`);
            return;
        }
    let metin = stdout;
    const idJsonAddressMatch = metin.match(/Wrote new keypair to (.+?)\n/);
    const idJsonAddress = idJsonAddressMatch ? idJsonAddressMatch[1] : null;

    const publicKeyMatch = metin.match(/pubkey: (.+?)\n/);
    const publicKey = publicKeyMatch ? publicKeyMatch[1] : null;

    const dataToWrite = {
        walletAddress: idJsonAddress,
        publickey: publicKey
    };

// JSON dosyasının adı ve yolu
    const jsonFilePath = 'wallet.json';

// Veriyi JSON formatına dönüştür
    const jsonData = JSON.stringify(dataToWrite, null, 2);

// Veriyi dosyaya yazma
    fs.writeFileSync(jsonFilePath, jsonData);
        res.send(publicKey)
        });
    });

// Diğer Express.js rotaları...
var urlencodedParser = bodyParser.urlencoded({ extended: false })
app.post("/airdrop", urlencodedParser, (req, res) => {
    var airdropValue = req.body.key;
    const command = "solana airdrop " + airdropValue; // Örnek bir terminal komutu

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Hata oluştu: ${error.message}`);
            res.status(500).send('İşlem sırasında hata oluştu.');
            console.error(`Hata çıktısı: ${stderr}`);
            return;
        }

        console.log(`Çıktı: ${stdout}`);
        res.send(stdout);
    });
})

app.post('/transfer', urlencodedParser, function (req, res) {
    var sendTo = req.body.key
    var tokenValue = req.body.value

    const command = "solana transfer "+sendTo+" "+tokenValue; // Örnek bir terminal komutu

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Hata oluştu: ${error.message}`);
            res.status(500).send('İşlem sırasında hata oluştu.');
            console.error(`Hata çıktısı: ${stderr}`);
            return;
        }

        console.log(`Çıktı: ${stdout}`);
        res.send(stdout);
    });
})


app.post('/balance', (req, res) => {
    const command = 'solana balance'; // Örnek bir terminal komutu

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Hata oluştu: ${error.message}`);
            res.status(500).send('İşlem sırasında hata oluştu.');
            console.error(`Hata çıktısı: ${stderr}`);
            return;
        }

        console.log(`Çıktı: ${stdout}`);
	res.send(stdout)

    });


});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
