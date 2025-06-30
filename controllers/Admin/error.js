const adminErrorMessages = (code, detail) => {
    const messages = {
        1000: {
            message: `İstek inputlarınız eksik lütfen kontrol ediniz.`,
            statusCode: 400,
            errorCode: 1000,
            detail
        },
        2000: {
            message: `Kendi teslimat yönteminizin olması zorunludur.`,
            statusCode: 400,
            errorCode: 2000,
            detail
        },
        2001: {
            message: `Sözleşme onayı zorunludur.`,
            statusCode: 400,
            errorCode: 2001,
            detail
        },
        2002: {
            message: `Bu ön başvuru zaten tamamlanmış.`,
            statusCode: 400,
            errorCode: 2002,
            detail
        },
        2003: {
            message: `Bu ön başvuru önceden reddedilmiş.`,
            statusCode: 400,
            errorCode: 2003,
            detail
        },
        2004: {
            message: `Bu ön başvuru tamamlandığı için red edilemez.`,
            statusCode: 400,
            errorCode: 2004,
            detail
        },
        2005: {
            message: `Bu email adresi ile başvuru yapılmış.`,
            statusCode: 400,
            errorCode: 2005,
            detail
        },
        2006: {
            message: `Bu kategori zaten kayıtlı.`,
            statusCode: 400,
            errorCode: 2006,
            detail
        },
        2007: {
            message: `Bu alt kategori zaten kayıtlı.`,
            statusCode: 400,
            errorCode: 2007,
            detail
        },
        2008: {
            message: `Bu ürün zaten kayıtlı.`,
            statusCode: 400,
            errorCode: 2008,
            detail
        },
        2009: {
            message: `Bu kategori mevcut değil.`,
            statusCode: 400,
            errorCode: 2009,
            detail
        },
        2010: {
            message: `Aktif istek bulunamadı.`,
            statusCode: 400,
            errorCode: 2010,
            detail
        },
    }
    return messages[code]
}

module.exports = {
    adminErrorMessages,
}
