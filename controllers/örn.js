/* eslint-disable no-unused-vars */
const {
    createCustomError,
    errorRoute,
    databaseActionType,
} = require('../../errors/custom-error')
const { makeActionHistory } = require('../../helpers/actionHistory')
const { sendLoginInfoToCompany, generateRandomPassword, sendEmail } = require('../../helpers/mail')
const mongoose = require('mongoose');
const crypto = require('crypto')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createSuccessMessage } = require('../../success/custom-success')
const { preInfoStatus } = require('./types')
const Product = require('../../models/product')
const User = require('../../models/user')
const Category = require('../../models/category')
const { Cart, Order } = require('../../models/Order')


// 👤 Yeni kullanıcı kaydı ve e-posta gönderimi
const registerUser = async (input, res) => {
    try {
        const { name, surname, email, password } = input;

        const exist = await User.findOne({ email });
        if (exist) return res.status(400).json({ success: false, code: 2401, message: 'Bu mail adresi zaten kayıtlı.' });

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({ name, surname, email, password: hashedPassword });
        if (!user) return res.status(500).json({ success: false, code: 2402, message: 'Kayıt başarısız.' });

        // Mail başlığı güncellendi (CleanPRO yerine e-ticaret temalı)
        const mailSuccess = await sendEmail(
            user.email,
            "🛒 E-Ticaret Platformuna Hoş Geldiniz!",
            `${user.name} ${user.surname}`,
            password // şifreyi isteğe göre burada göndermeye devam ediyoruz
        );

        if (!mailSuccess) return res.status(200).json({ success: false, code: 2404, message: 'Kayıt başarılı ancak e-posta gönderilemedi.' });

        return res.status(201).json({ success: true, code: 2403, message: 'Kayıt başarılı.', data: user });
    } catch (error) {
        console.error('registerUser Hatası:', error);
        return res.status(500).json({ success: false, code: 9000, message: 'Beklenmeyen bir hata oluştu.' });
    }
};

// 🔐 Kullanıcı girişi ve token üretimi
const loginUser = async (input, res) => {
  try {
    const { email, password } = input;
    const user = await User.findOne({ email, isActive: true });
    if (!user) return res.status(404).json({ success: false, code: 1105, message: "Kullanıcı yok." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ success: false, code: 1106, message: "Şifre yanlış." });

    const token = jwt.sign(
      { userId: user._id, role: user.role, name: user.name, surname: user.surname, email: user.email },
      'your_jwt_secret',
      { expiresIn: '1h' }
    );

    return res.status(200).json({ success: true, code: 2000, token,user, message: "Giriş başarılı." });
  } catch (error) {
    return res.status(500).json({ success: false, code: 9000, message: "Sunucu hatası." });
  }
};

// 🔑 Şifre değiştirme işlemi
const changePassword = async (input, res) => {
  try {
    const { userId, oldPassword, newPassword } = input;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, code: 2501, message: "Kullanıcı yok" });

    const match = await bcrypt.compare(oldPassword, user.password);
    if (!match) return res.status(400).json({ success: false, code: 2502, message: "Eski şifre yanlış" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.status(200).json({ success: true, code: 2503, message: "Şifre güncellendi" });
  } catch (err) {
    console.error("changePassword Hatası:", err);
    return res.status(500).json({ success: false, code: 9000, message: "Hata oluştu" });
  }
};


// 📄 Kullanıcı bilgilerini getirme
const getUserInfo = async (input, res, next) => {
    try {
        const user = await User.findById(input.userId);
        if (!user) return next(createCustomError(2407, errorRoute.enum.user, 'Kullanıcı bulunamadı.'));

        return res.status(200).json({
            name: user.name,
            surname: user.surname,
            email: user.email,
            role: user.role,
            address: user.address,
            phone: user.phone
        });
    } catch (error) {
        return next(createCustomError(9000, errorRoute.enum.general));
    }
};
////////////////////////////////////////////////////////
// ➕ Yeni ürün ekleme (multer destekli)
const setProduct = async (input, res, next) => {
    try {
        const req = res.locals.req; // 🔑 req burada alınıyor

        const { name, description, price, stock, categoryId } = input;

        // 📦 Resim dosyası multer ile geldi mi kontrol et
        const image = req.file?.filename;
        console.log('Gelen dosya:', req.file);
        if (!image) {
            return next(createCustomError(2005, errorRoute.enum.admin, 'Ürün görseli yüklenemedi.'));
        }

        // 🔍 Aynı isimde ürün var mı kontrol et
        const exist = await Product.findOne({ name });
        if (exist) {
            return next(createCustomError(2001, errorRoute.enum.admin, 'Bu ürün zaten mevcut.'));
        }

        // 🔍 Kategori geçerli mi
        const categoryExist = await Category.findById(categoryId.trim());
        if (!categoryExist) {
            return next(createCustomError(2004, errorRoute.enum.admin, 'Geçerli bir kategori bulunamadı.'));
        }

        // ✅ Yeni ürün oluştur
        const newProduct = new Product({
            name,
            description: description || '',
            price,
            stock,
            categoryId,
            image
        });

        const result = await newProduct.save();
        if (!result) {
            return next(createCustomError(2002, errorRoute.enum.admin, 'Ürün eklenemedi.'));
        }

        // ✅ Kategoriye ürün ID'sini string olarak ekle
        await Category.findByIdAndUpdate(
            categoryId.trim(),
            {
                $push: { productList: result._id.toString() }, // string olarak ekleniyor
                $set: { updatedAt: new Date() } // updatedAt güncelleniyor
            }
        );

        return next(createSuccessMessage(2000, result));
    } catch (error) {
        console.error('setProduct Hatası:', error);
        return next(createCustomError(9000, errorRoute.enum.general));
    }
};

// ✏️ Ürün güncelleme işlemi
const updateProduct = async (input, res, next) => {
    try {
        const updateData = { ...input, updateAt: Date.now() };
        delete updateData.id;

        const result = await Product.findByIdAndUpdate(input.id, updateData);
        if (!result) return next(createCustomError(2004, errorRoute.enum.product, 'Güncelleme başarısız.'));

        return next(createSuccessMessage(2005));
    } catch (error) {
        return next(createCustomError(9000, errorRoute.enum.general));
    }
};

// ❌ Ürün silme işlemi
const deleteProduct = async (input, res, next) => {
    try {
        const result = await Product.findByIdAndDelete(input.productId);
        if (!result) return next(createCustomError(2006, errorRoute.enum.product, 'Silme başarısız.'));

        return next(createSuccessMessage(2007));
    } catch (error) {
        return next(createCustomError(9000, errorRoute.enum.general));
    }
};

// 📦 Tüm ürünleri listeleme
const getAllProducts = async (input, res) => {
    try {
        const products = await Product.find();
        return res.status(200).json(products);
    } catch (error) {
        return next(createCustomError(9000, 'product'));
    }
};
/////////////////////////////////////////////////////////

// 🛒 Sepete ürün ekleme
const addToCart = async (input, res, next) => {
    try {
        const cart = await Cart.findOne({ userId: input.userId });
        if (!cart) {
            await Cart.create({
                userId: input.userId,
                products: [{ productId: input.productId, quantity: input.quantity }]
            });
        } else {
            const existing = cart.products.find(p => p.productId === input.productId);
            if (existing) {
                existing.quantity += input.quantity;
            } else {
                cart.products.push({ productId: input.productId, quantity: input.quantity });
            }
            await cart.save();
        }

        return next(createSuccessMessage(2010));
    } catch (error) {
        return next(createCustomError(9000, errorRoute.enum.general));
    }
};

// 🧾 Sepetten sipariş oluşturma
const createOrder = async (input, res) => {
  try {
    const cart = await Cart.findOne({ userId: input.userId });
    if (!cart || cart.products.length === 0)
      return res.status(400).json({ success: false, code: 2011, message: "Sepet boş." });

    for (const item of cart.products) {
      const product = await Product.findById(item.productId);
      if (!product || product.stock < item.quantity)
        return res.status(400).json({ success: false, code: 2012, message: "Stok yetersiz." });
    }

    const order = await Order.create({
      userId: input.userId,
      products: cart.products,
      address: input.address,
      status: 'beklemede',
      createdAt: Date.now()
    });

    await User.findByIdAndUpdate(input.userId, {
      $push: { orders: order._id.toString() }
    });

    await Cart.findOneAndDelete({ userId: input.userId });

    return res.status(201).json({ success: true, code: 2013, message: "Sipariş alındı." });
  } catch (error) {
    console.error("createOrder:", error);
    return res.status(500).json({ success: false, code: 9000, message: "Sunucu hatası." });
  }
};

// 📋 Siparişleri listeleme (admin/kullanıcı)
const listOrders = async (input, res, next) => {
    try {
        const query = input.userId ? { userId: input.userId } : {};
        const orders = await Order.find(query);
        return res.status(200).json(orders);
    } catch (error) {
        return next(createCustomError(9000, errorRoute.enum.general));
    }
};

// 🚚 Sipariş durumunu güncelle (örnek: tamamlandı)
const updateOrderStatus = async (input, res, next) => {
    try {
        const order = await Order.findById(input.orderId);
        if (!order) return next(createCustomError(2014, errorRoute.enum.order, 'Sipariş bulunamadı.'));

        // Eğer sipariş tamamlanıyorsa → stok düş
        if (input.status === 'tamamlandı') {
            for (const item of order.products) {
                const product = await Product.findById(item.productId);
                if (!product || product.stock < item.quantity) {
                    return next(createCustomError(2012, errorRoute.enum.product, 'Stok yetersiz. (Sipariş tamamlanamıyor)'));
                }
                product.stock -= item.quantity;
                await product.save();
            }
        }

        order.status = input.status;
        await order.save();

        return next(createSuccessMessage(2015));
    } catch (error) {
        return next(createCustomError(9000, errorRoute.enum.general));
    }
};

// 📦 Sipariş detaylarını getirme
const getOrderDetail = async (input, res, next) => {
    try {
        const order = await Order.findById(input.orderId);
        if (!order) return next(createCustomError(2016, errorRoute.enum.order, 'Sipariş bulunamadı.'));
        return res.status(200).json(order);
    } catch (error) {
        return next(createCustomError(9000, errorRoute.enum.general));
    }
};

// ✅ Siparişin durumunu kontrol etme
const checkOrderStatus = async (input, res, next) => {
    try {
        const order = await Order.findById(input.orderId);
        if (!order || order.userId !== input.userId) {
            return next(createCustomError(2017, errorRoute.enum.order, 'Sipariş bulunamadı.'));
        }

        return res.status(200).json({ status: order.status });
    } catch (error) {
        return next(createCustomError(9000, errorRoute.enum.general));
    }
};

// 🔍 Ürün stok kontrolü yapma
const checkStock = async (input, res, next) => {
    try {
        const product = await Product.findById(input.productId);
        if (!product) return next(createCustomError(2018, errorRoute.enum.product, 'Ürün bulunamadı.'));

        return res.status(200).json({ stock: product.stock });
    } catch (error) {
        return next(createCustomError(9000, errorRoute.enum.general));
    }
};

// 📦 Ürün stok bilgisini güncelleme
const updateStock = async (input, res, next) => {
    try {
        const product = await Product.findById(input.productId);
        if (!product) return next(createCustomError(2019, errorRoute.enum.product, 'Ürün bulunamadı.'));

        product.stock = input.stock;
        await product.save();

        return next(createSuccessMessage(2020));
    } catch (error) {
        return next(createCustomError(9000, errorRoute.enum.general));
    }
};
/////////////////////////////////////////////////////////


// ➕ Yeni kategori ekleme
const setCategory = async (input, res, next) => {
    try {
        const exist = await Category.findOne({ name: input.name });
        if (exist) return next(createCustomError(2001, errorRoute.enum.admin, 'Kategori zaten mevcut.'));

        const created = await Category.create(input);
        if (!created) return next(createCustomError(2002, errorRoute.enum.admin, 'Kategori eklenemedi.'));

        return next(createSuccessMessage(2000));
    } catch (error) {
        return next(createCustomError(9000, errorRoute.enum.general));
    }
};

// ✏️ Kategori bilgisi güncelleme
const updateCategory = async (input, res, next) => {
    try {
        const result = await Category.findByIdAndUpdate(input.categoryId, input);
        if (!result) return next(createCustomError(2604, errorRoute.enum.category, 'Kategori güncellenemedi.'));
        return next(createSuccessMessage(2605));
    } catch (error) {
        return next(createCustomError(9000, errorRoute.enum.general));
    }
};

// ❌ Kategori silme işlemi
const deleteCategory = async (input, res, next) => {
    try {
        const result = await Category.findByIdAndDelete(input.categoryId);
        if (!result) return next(createCustomError(2606, errorRoute.enum.category, 'Kategori silinemedi.'));
        return next(createSuccessMessage(2607));
    } catch (error) {
        return next(createCustomError(9000, errorRoute.enum.general));
    }
};

// 📚 Tüm kategorileri getirme
const getAllCategories = async (input, res, next) => {
    try {
        const result = await Category.find();
        return res.status(200).json(result);
    } catch (error) {
        return next(createCustomError(9000, errorRoute.enum.general));
    }
};

// 📦 Kategoriye göre ürünleri listeleme
const getProductsByCategory = async (input, res, next) => {
    try {
        const { categoryId } = input;

        const category = await Category.findById(categoryId);
        if (!category || !category.productList || category.productList.length === 0) {
            return res.status(200).json([]);
        }

        const products = await Product.find({
            _id: { $in: category.productList }
        });

        return res.status(200).json(products);
    } catch (error) {
        return next(createCustomError(9000, errorRoute.enum.general));
    }
};
//////////////////////////////////////////////

// 👤 Kullanıcının profil bilgilerini getirme
const getUserProfile = async (input, res) => {
    try {
        const user = await User.findById(input.user.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "Kullanıcı bulunamadı." });
        }
        return res.status(200).json({ success: true, data: user });
    } catch (err) {
        console.error("getUserProfile:", err);
        return res.status(500).json({ success: false, message: "Hata oluştu." });
    }
};

// ✏️ Kullanıcı profil bilgilerini güncelleme
const updateUserProfile = async (input, res) => {
    try {
        const { name, surname, phone, address } = input;
        const user = await User.findByIdAndUpdate(input.user.userId, { name, surname, phone, address }, { new: true });
        if (!user) {
            return res.status(400).json({ success: false, message: "Güncelleme başarısız." });
        }
        return res.status(200).json({ success: true, message: "Güncellendi", data: user });
    } catch (err) {
        console.error("updateUserProfile:", err);
        return res.status(500).json({ success: false, message: "Hata oluştu." });
    }
};

// 📦 Kullanıcının sipariş geçmişini listeleme
const getUserOrders = async (input, res) => {
    try {
        const orders = await Order.find({ userId: input.user.userId });
        return res.status(200).json({ success: true, data: orders });
    } catch (err) {
        console.error("getUserOrders:", err);
        return res.status(500).json({ success: false, message: "Hata oluştu." });
    }
};

// 🛒 Giriş yapmadan misafir siparişi oluşturma
const guestOrder = async (input, res) => {
  try {
    const { name, phone, email, address, products } = input;

    if (!products || products.length === 0) {
      return res.status(400).json({ success: false, code: 3001, message: "Sepet boş." });
    }

    const order = await Order.create({
      name,
      phone,
      email,
      address,
      products,
      isGuest: true,
      createdAt: new Date(),
    });

    if (!order) {
      return res.status(500).json({ success: false, code: 3002, message: "Sipariş oluşturulamadı." });
    }

    return res.status(200).json({ success: true, code: 3000, message: "Sipariş alındı." });
  } catch (error) {
    console.error("guestOrder hatası:", error);
    return res.status(500).json({ success: false, code: 9000, message: "Sunucu hatası." });
  }
};

// 🔎 ID ile kullanıcı bilgisi getirme (admin için)
const getUser = async (input, res) => {
  try {
    const { userId } = req.body; // DİKKAT: req.body olmalı
    if (!userId)
      return res.status(400).json({ success: false, code: 2601, message: "ID gerekli." });

    const user = await User.findById(userId).select("-password");
    if (!user)
      return res.status(404).json({ success: false, code: 2602, message: "Bulunamadı." });

    return res.status(200).json({
      success: true,
      code: 2603,
      message: "Kullanıcı getirildi.",
      data: user
    });
  } catch (err) {
    console.error("getUser Hatası:", err);
    return res.status(500).json({ success: false, code: 9000, message: "Sunucu hatası." });
  }
};

// 📦 Sipariş ID'sine göre detayları getirme
const getOrderById = async (input, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: "Sipariş bulunamadı." });

    const productDetails = await Promise.all(order.products.map(async (p) => {
      const product = await Product.findById(p.productId);
      return { name: product?.name || "Ürün", quantity: p.quantity };
    }));

    return res.status(200).json({ success: true, data: { ...order._doc, products: productDetails } });
  } catch (err) {
    console.error("getOrderById Hatası:", err);
    return res.status(500).json({ success: false, message: "Sunucu hatası." });
  }
};

const {
    PAYTR_MERCHANT_ID,
    PAYTR_MERCHANT_KEY,
    PAYTR_MERCHANT_SALT,
    PAYTR_SUCCESS_URL,
    PAYTR_FAIL_URL
} = process.env;

// 💳 PayTR ile ödeme başlatma işlemi
const createPayment = async (input, res, next) => {
    try {
        const userId = input.userId;
        const basket = input.basket; // [{productId, name, price, quantity}]
        const email = input.email;
        const phone = input.phone;
        const address = input.address;
        const totalAmount = input.totalAmount;

        // Sepet formatı: [[ürün adı, birim fiyat kuruş, adet], [...]]
        const userBasket = basket.map(p => [p.name, p.price * 100, p.quantity]);

        const user_ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
        const merchant_oid = 'OID' + Date.now();

        const paytr_data = {
            merchant_id: PAYTR_MERCHANT_ID,
            user_ip,
            merchant_oid,
            email,
            payment_amount: totalAmount * 100,
            paytr_token: '',
            user_basket: Buffer.from(JSON.stringify(userBasket)).toString('base64'),
            no_installment: '0',
            max_installment: '12',
            currency: 'TL',
            test_mode: '1',
            merchant_ok_url: PAYTR_SUCCESS_URL,
            merchant_fail_url: PAYTR_FAIL_URL,
            user_name: input.name,
            user_address: address,
            user_phone: phone,
        };

        const token_str = `${PAYTR_MERCHANT_ID}${user_ip}${merchant_oid}${email}${paytr_data.payment_amount}${paytr_data.user_basket}${paytr_data.no_installment}${paytr_data.max_installment}${paytr_data.currency}${paytr_data.test_mode}`;
        const paytr_token = crypto
            .createHmac('sha256', PAYTR_MERCHANT_KEY)
            .update(token_str + PAYTR_MERCHANT_SALT)
            .digest('base64');

        paytr_data.paytr_token = paytr_token;

        const { data } = await axios.post('https://www.paytr.com/odeme/api/get-token', qs.stringify(paytr_data), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        if (data.status === 'success') {
            return res.status(200).json({
                token: data.token,
                iframeUrl: `https://www.paytr.com/odeme/guvenli/${data.token}`,
                orderCode: merchant_oid
            });
        } else {
            return next(createCustomError(2701, 'payment', 'Ödeme başlatılamadı.'));
        }
    } catch (error) {
        console.log(error.response?.data || error.message);
        return next(createCustomError(9000, 'payment'));
    }
};

// Webhook → Ödeme sonucu burada doğrulanır
// 🔁 PayTR ödeme sonucu doğrulama (callback)
const paymentCallback = async (input, res) => {
    const {
        merchant_oid,
        status,
        total_amount,
        hash,
        payment_amount
    } = req.body;

    const token = crypto
        .createHmac('sha256', PAYTR_MERCHANT_KEY)
        .update(merchant_oid + PAYTR_MERCHANT_SALT + status + payment_amount)
        .digest('base64');

    if (token !== hash) return res.status(400).send('INVALID');

    if (status === 'success') {
        // Burada istenirse veritabanına ödeme onayı yazılabilir
        console.log(`✅ Ödeme başarılı: ${merchant_oid}`);
    } else {
        console.log(`❌ Ödeme başarısız: ${merchant_oid}`);
    }

    return res.status(200).send('OK');
};

module.exports = {
    setProduct,
    updateProduct,
    deleteProduct,
    getAllProducts,
    addToCart,
    createOrder,
    listOrders,
    updateOrderStatus,
    registerUser,
    loginUser,
    changePassword,
    getUserInfo,
    getOrderDetail,
    checkOrderStatus,
    checkStock,
    updateStock,
    setCategory,
    updateCategory,
    deleteCategory,
    getAllCategories,
    getProductsByCategory,
    createPayment,
    paymentCallback,
    getUserProfile,
    updateUserProfile,
    getUserOrders,
    guestOrder,
    getUser,
    getOrderById
}
