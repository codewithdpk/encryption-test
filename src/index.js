const express = require("express");

const app = express();

const CryptoJS = require("crypto-js");

var keySize = 256;
var ivSize = 128;
var iterations = 100;
var my_private_key = "encrypt.me1213";

app.get("/encrypt/:message", (req, res) => {
  console.log(req);
  var salt = CryptoJS.lib.WordArray.random(128 / 8);

  var key = CryptoJS.PBKDF2(my_private_key, salt, {
    keySize: keySize / 32,
    iterations: iterations
  });

  var iv = CryptoJS.lib.WordArray.random(128 / 8);

  var encrypted = CryptoJS.AES.encrypt(req.params.message, key, {
    iv: iv,
    padding: CryptoJS.pad.Pkcs7,
    mode: CryptoJS.mode.CBC
  });

  // salt, iv will be hex 32 in length
  // append them to the ciphertext for use  in decryption
  var transitmessage = salt.toString() + iv.toString() + encrypted.toString();
  res.json({ status: 200, cypher_text: transitmessage });
});

// Decrypt the message
app.get("/decrypt/:cypher_text", (req, res) => {
  var salt = CryptoJS.enc.Hex.parse(req.params.cypher_text.substr(0, 32));
  var iv = CryptoJS.enc.Hex.parse(req.params.cypher_text.substr(32, 32));
  var encrypted = req.params.cypher_text.substring(64);

  var key = CryptoJS.PBKDF2(my_private_key, salt, {
    keySize: keySize / 32,
    iterations: iterations
  });

  var decrypted = CryptoJS.AES.decrypt(encrypted, key, {
    iv: iv,
    padding: CryptoJS.pad.Pkcs7,
    mode: CryptoJS.mode.CBC
  });
  res.json({
    status: 200,
    decrypted_message: decrypted.toString(CryptoJS.enc.Utf8)
  });
});

app.listen(8080, () => console.log("Server is running on port : 8080"));
