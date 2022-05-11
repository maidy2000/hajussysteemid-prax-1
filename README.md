# Käivitamine
### Installimiseks
```
npm install
```

### Töölepanemine
```
npm start -- --host HOST --port PORT --owner PUBLIC_KEY
```
`HOST` argumendi võib ära jätta. Default host on `127.0.0.1`
`PORT` argumendi võib ära jätta. Default port on `5555`

# Endpointid
- ## Aadresside küsimine
    - ### Päring GET
    ```
    http://xx.xx.xx.xx:yyyy/nodes
    ```
    - ### Vastus
    ```
    [
        "xx.xx.xx.xx:yyyy",
        "xx.xx.xx.xx:yyyy"
    ]
- ## Aadresside lisamine
    - ### Päring POST
    ```
    http://xx.xx.xx.xx:yyyy/nodes
    ```
    - ### Text body
    ```
    xx.xx.xx.xx:yyyy
    ```
- ## Ülekannete lisamine
    - ### Päring POST
    ```
    http://xx.xx.xx.xx:yyyy/transactions
    ```

    - ### JSON body
    ```
    {
       "from": "public key",
       "to": "public key",
       "sum": 1,
       "timestamp": "2022-05-11T07:32:51Z" ,
       "signature": "signature"
    }
    ```

- ## Bloki lisamine
    - ### Päring POST
    ```
    http://xx.xx.xx.xx:yyyy/blocks
    ```

    - ### JSON body
    ```
    {
        "number": 2,
        "previousHash": "mingi eelmine hash",
        "nonce": "mingi nonce",
        "hash": "mingi hash",
        "transactions": [
            {
                "from": "public key",
                "to": "public key",
                "sum": 1,
                "timestamp": "2022-05-11T07:32:51Z" ,
                "signature": "signature"
            }
        ]
    }
    ```

- ## Blocki küsimine
    - ### Päring GET
    ```
    http://xx.xx.xx.xx:yyyy/blocks
    ```
    - ### Response
    ```
    [
        {
            "number": 2,
            "previousHash": "mingi eelmine hash",
            "nonce": "mingi nonce",
            "hash": "mingi hash",
            "transactions": [
                {
                    "from": "public key",
                    "to": "public key",
                    "sum": 1,
                    "timestamp": "2022-05-11T07:32:51Z" ,
                    "signature": "signature"
                }
            ]
        }
    ]
    ```

# Example
Kasutajate haldamiseks on `helper.js` skript, kuhu on salvestatud kolm kasutajat. 
## Node'ide startimine
1. Esimene terminal: `npm start -- --port 5555 --owner "-----BEGIN PUBLIC KEY-----MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBALplS6RCLvnvymjt/WzqWsSEQupJ9em0VArB5RCit4WdJYurdXDl2yHFF3jWZ2aHghqxRGO5GXaP9i29vTN22pkCAwEAAQ==-----END PUBLIC KEY-----"`
2. Teine terminal: `npm start -- --port 5554 --owner "-----BEGIN PUBLIC KEY-----MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAMeOo2bs79TZh+3Nqip9PeRXn7BnPdHpdVfAkReWEvkts84OxUnAex50nvnaF5F4Iza9vPxZKpq1bdS5sGhbC2kCAwEAAQ==-----END PUBLIC KEY-----"`
## Aadressi lisamine
Päring `POST 127.0.0.1:5555/nodes`, mille body `"127.0.0.1:5554"`

Varsti (1-5s pärast) peaks mõlemal terminalil näha olema teineteise aadress.
## Transactioni saatmine
`helpre.js` Skriptiga saab valida nende kolme kasutaja vahelt saatja ja saaja. Allkirjastamisega tegeleb skript ise.

Esimeses plokis `database.ts` on kasutajale `1` antud 1 raha. Seega saame teha tehingu:
1. `node helper.js`
2. Choose sender (0-2): `1`
3. Choose receiver (0-2): `0`
4. Amount to transfer: `0.5`
5. Target node's port: `5555`

Üsna koheselt peaks mõlemas terminalis näha olema ülekannet ja varsti ka kaevatud blokki.

# Puudused
1. Merkle puud ei kasutata. Kõik kontrollimine on lineaarne plokk-ploki-kaupa.
2. Parem ahel valitakse _ainult_ pikkuse järgi.
3. Uue ja parema ahela saamisel ahelat ennast ei kontrollita. Küll aga kontrollitakse plokid korralikult läbi kui need tulevad ainult ühekaupa.
4. Erindite käistlemist väga ei ole. Vigane päring võib (aga ei pruugi) programmi katki teha.
