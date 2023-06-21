export default class radioFormatter {
    static formatRadioOptions(radioOptions: string) {
        const toUpperCaseStrippedWhiteSpaces = radioOptions.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('');
        return toUpperCaseStrippedWhiteSpaces.replace(/,/g, '');
    }
}