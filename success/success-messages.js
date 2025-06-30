const successMessages = (code, detail) => {
  const messages = {
    2000: {
      message: `Bilgiler başarıyla gönderildi.`,
      statusCode: 200,
      successCode: 2000,
      detail,
    },
    2001: {
      message: `Ön başvurular.`,
      statusCode: 200,
      successCode: 2001,
      detail,
    },
    2002: {
      message: `Güncelleme başarılı.`,
      statusCode: 200,
      successCode: 2001,
      detail,
    },
    2003: {
      message: `Giriş başarılı.`,
      statusCode: 200,
      successCode: 2003,
      detail,
    },
    2004: {
      message: `Kategori silme işlemi başarılı.`,
      statusCode: 200,
      successCode: 2004,
      detail,
    },
    2005: {
      message: `Ürünler onaya gönderildi.`,
      statusCode: 200,
      successCode: 2005,
      detail,
    },
    2006: {
      message: `Bekleyen ürün onayları.`,
      statusCode: 200,
      successCode: 2006,
      detail,
    }
  }
  return messages[code]
}

module.exports = {
  successMessages,
}
