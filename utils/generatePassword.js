function generatePassword() {
    const specialSymbols = '!@#$%^&*()_-+=<>?';
    const numbers = '0123456789';
    const allCharacters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

    const getRandomChar = (characters) => {
        const randomIndex = Math.floor(Math.random() * characters.length);
        return characters[randomIndex];
    };

    let password = '';
    password += getRandomChar(specialSymbols);
    password += getRandomChar(numbers);

    const remainingLength = Math.max(6, 16 - password.length);
    const allAvailableCharacters = allCharacters + specialSymbols + numbers;

    for (let i = 0; i < remainingLength; i++) {
        password += getRandomChar(allAvailableCharacters);
    }
    const passwordArray = password.split('');

    for (let i = passwordArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [passwordArray[i], passwordArray[j]] = [passwordArray[j], passwordArray[i]];
    }
    password = passwordArray.join('');
    return password;
}
module.exports = { generatePassword }