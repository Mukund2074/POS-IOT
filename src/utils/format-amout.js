import numeral from 'numeral';
import 'numeral/locales';

numeral.register('locale', 'da', {
    delimiters: {
        thousands: '.',
        decimal: ',',
    },
    abbreviations: {
        thousand: 'k',
        million: 'm',
        billion: 'b',
        trillion: 't',
    },
    currency: {
        symbol: 'kr.',
    },
});

numeral.locale('da');

const formatAmount = (value, isShort = false, negativeSymbol = false) => {
    // const decimalPlace = "2";

    // const decimalPlaceNumber = decimalPlace ? parseInt(decimalPlace) : 2;

    // let decimalFormat = "";

    // if (decimalPlaceNumber === 1) {
    //   decimalFormat = "0";
    // } else if (decimalPlaceNumber === 2) {
    //   decimalFormat = "00";
    // } else if (decimalPlaceNumber === 3) {
    //   decimalFormat = "000";
    // } else if (decimalPlaceNumber === 4) {
    //   decimalFormat = "0000";
    // } else if (decimalPlaceNumber === 5) {
    //   decimalFormat = "00000";
    // } else if (decimalPlaceNumber === 6) {
    //   decimalFormat = "000000";
    // }

    // let formattedValue = numeral(value).format(`0,0.${decimalFormat}`);

    if (isShort) {
        return `${numeral(parseFloat(value)).format('0,0.00a') + ' kr.'}`;
    }

    // if (Number(value) < 0) {
    //   if (negativeSymbol) {
    //     formattedValue = `(${formattedValue.replace("-", "")})`;
    //   } else {
    //     formattedValue = formattedValue.replace("-", "");
    //   }
    // }

    return `${numeral(parseFloat(value)).format('0,0.00') + ' kr.'}`;
};

const formatAmountWithoutCurrency = (value) => {
    const decimalPlace = 2;
    var number = decimalPlace;
    var decimalFormat = '';

    if (number === 1) {
        decimalFormat = '0';
    } else if (number === 2) {
        decimalFormat = '00';
    } else if (number === 3) {
        decimalFormat = '000';
    } else if (number === 4) {
        decimalFormat = '0000';
    } else if (number === 5) {
        decimalFormat = '00000';
    } else if (number === 6) {
        decimalFormat = '000000';
    }
    return numeral(value).format(`0.${decimalFormat}`);
};

const formatQuantity = (value, number = 2) => {
    var decimalFormat = '';
    if (number === 0) {
        return value;
    } else if (number === 1) {
        return value;
    } else if (number === 2) {
        decimalFormat = '00';
    } else if (number === 3) {
        decimalFormat = '000';
    } else if (number === 4) {
        decimalFormat = '0000';
    } else if (number === 5) {
        decimalFormat = '00000';
    } else if (number === 6) {
        decimalFormat = '000000';
    }
    return numeral(value).format(`00.${decimalFormat}`);
};

const formatPercentage = (value) => {
    var number = 0;
    var decimalFormat = '';

    if (number === 1) {
        decimalFormat = '0';
    } else if (number === 2) {
        decimalFormat = '00';
    } else if (number === 3) {
        decimalFormat = '000';
    }
    return numeral(value).format(`0.${decimalFormat}`) + '%';
};

const formatPercentagewithoutSymbol = (value) => {
    var number = 2;
    var decimalFormat = '';

    if (number === 1) {
        decimalFormat = '0';
    } else if (number === 2) {
        decimalFormat = '00';
    } else if (number === 3) {
        decimalFormat = '000';
    }
    return numeral(value).format(`0.${decimalFormat}`);
};

const parseAmount = (value, returnInString) => {
    const decimalPlace = 2;
    var number = decimalPlace;

    const parsedValue = typeof value === 'string' ? parseFloat(value) : value;
    const formattedValue = numeral(parsedValue).format(`0.${'0'.repeat(number)}`);
    const floatvalue = parseFloat(formattedValue);

    if (returnInString) {
        return formattedValue;
    } else {
        return floatvalue;
    }
};

const formatPriceInput = (price) => {
    const numericValue = price.replace(/[^0-9.]/g, '');
    // Ensure only one decimal point is allowed
    const parts = numericValue.split('.');
    let formattedValue = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : numericValue;
    // Limit to 2 decimal places
    if (parts.length === 2 && parts[1].length > 2) {
        formattedValue = parts[0] + '.' + parts[1].substring(0, 2);
    }

    return formattedValue;
};

export {
    formatAmount,
    formatAmountWithoutCurrency,
    formatQuantity,
    formatPercentage,
    formatPercentagewithoutSymbol,
    parseAmount,
    formatPriceInput,
};
