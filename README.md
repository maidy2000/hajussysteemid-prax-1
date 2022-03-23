# Nõuded tööle
http://lambda.ee/wiki/Vorgurakendused_2_prax_1_2022_kevad
# Serveri käivitamine
## Esimesel korral
```bash
npm install
```
## Iga kord
```bash
node index.js PORT
```
`PORT` argumendi võib ka ära jätta, sellisel juhul kasutatakse by default porti 5555.

# Võimalikud päringud
- ## Aadresside küsimine
  - ### Päring (GET)
  ```
  http://xx.xx.xx.xx:yyyy/addresses
  ```
  - ### Vastus
  Response code: 200
  ```
  [
     "xx.xx.xx.xx:yyyy",
     "xx.xx.xx.xx:yyyy"
  ]
  ```
- ## Kõikide blokkide hashide küsimine
  - ### Päring (GET)
  ```
  http://xx.xx.xx.xx:yyyy/blocks
  ```
  - ### Vastus
  Response code: 200
  ```
  [
     "hash1",
     "hash2",
     "hash3",
     "hash4"
  ]
  ```
- ## Blokkide küsimine alates mingist hashist
  - ### Päring (GET)
  ```
  http://xx.xx.xx.xx:yyyy/blocks/hash2
  ```
  - ### Vastus
  Response code: 200
  ```
  [
     "hash3",
     "hash4"
  ]
  ```
- ## Bloki sisu küsimine hashi järgi
  - ### Päring (GET)
  ```
  http://xx.xx.xx.xx:yyyy/getData/hash
  ```
  - ### Võimalikud vastused
    - #### Kui selline hash oli olemas  
      Response code: 200
      ```
      {
         "id": hash,
         "content": blockContent
      }
      ```
    - #### Kui sellist hashi polnud olemas
      Response code: 406
      ```
      {
         "error": "No block with id {hash}"
      }
      ```
- ## Uue bloki saatmine
  - ### Päring (POST)
  ```
  http://xx.xx.xx.xx:yyyy/block
  ```
    #### JSON keha
    ```
  {
    "id": hash,
	 "content": content
  }
  ```
  - ### Võimalikud vastused
    - #### Kui sellist blokki ei olnud veel
      Response code: 200
      ```
      1
      ```
    - #### Kui selline blokk oli juba olemas
      Response code: 406
      ```
      {
        "error": "block already exists"
      }
      ```
- ## Uue tehingu saatmine
    - ### Päring (POST)
  ```
  http://xx.xx.xx.xx:yyyy/inv
  ```
  #### JSON keha
    ```
  {
    "id": hash,
	 "content": content
  }
  ```
    - ### Võimalikud vastused
        - #### Kui sellist blokki ei olnud veel
          Response code: 200
          ```
          1
          ```
        - #### Kui selline blokk oli juba olemas
          Response code: 406
          ```
          {
            "error": "inv already exists"
          }
          ```