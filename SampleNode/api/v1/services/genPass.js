function genratePassword() {
    return new Promise((resolve, reject) => {

        checkboxes = [{
            "id": "lowercase",
            "label": "a-z",
            "library": "abcdefghijklmnopqrstuvwxyz",
            "checked": true
        }, {
            "id": "uppercase",
            "label": "A-Z",
            "library": "ABCDEFGHIJKLMNOPWRSTUVWXYZ",
            "checked": true
        }, {
            "id": "numbers",
            "label": "0-9",
            "library": "0123456789",
            "checked": true
        }, {
            "id": "symbols",
            "label": "!-?",
            "library": "!@#$%^&*-_=+\\|:;',.\<>/?~",
            "checked": true
        }]
        lowercase = checkboxes[0].checked;
        uppercase = checkboxes[1].checked;
        numbers = checkboxes[2].checked;
        symbols = checkboxes[3].checked;

        passwordLenght = 8;
        newPassword = "";
        passwordLength = 8;
        const lowerCase = 'abcdefghijklmnopqrstuvwxyz'
        const upperCase = lowerCase.toUpperCase()
        const numberChars = '0123456789'
        const specialChars = '!"@$%+-_?^&*()'

        let generatedPassword = ''
        let restPassword = ''

        const restLength = passwordLength % 4
        const usableLength = passwordLength - restLength
        const generateLength = usableLength / 4

        const randomString = (char) => {
            return char[Math.floor(Math.random() * (char.length))]
        }
        for (let i = 0; i <= generateLength - 1; i++) {
            generatedPassword += `${randomString(lowerCase)}${randomString(upperCase)}${randomString(numberChars)}${randomString(specialChars)}`
        }

        for (let i = 0; i <= restLength - 1; i++) {
            restPassword += randomString([...lowerCase, ...upperCase, ...numberChars, ...specialChars])
        }
        resolve(generatedPassword + restPassword)
    })
}

module.exports = {
    genratePassword
}