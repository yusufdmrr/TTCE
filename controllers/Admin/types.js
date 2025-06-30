const { z } = require('zod')

const setProductInput = z.object({
    name: z.string(),
    description: z.string().optional(),
    price: z.number(),
    stock: z.number(),
    categoryId: z.string(),
    image: z.string().optional(),
});

const updateProductInput = z.object({
    productId: z.string(),
    name: z.string().optional(),
    description: z.string().optional(),
    price: z.number().optional(),
    stock: z.number().optional(),
    category: z.string().optional(),
    image: z.string().optional(),
});

const deleteProductInput = z.object({
    productId: z.string()
});

const addToCartInput = z.object({
    userId: z.string(),
    productId: z.string(),
    quantity: z.number().min(1)
});

const createOrderInput = z.object({
    userId: z.string(),
    address: z.string()
});

const listOrdersInput = z.object({
    userId: z.string().optional()
});

const updateOrderStatusInput = z.object({
    orderId: z.string(),
    status: z.enum(['beklemede', 'tamamlandı', 'iptal', 'hazırlanıyor'])

});

const getAllProductsInput = z.object({
})

const registerUserInput = z.object({
    name: z.string(),
    surname: z.string(),
    email: z.string().email(),
    password: z.string().min(6),
    address: z.string().optional(),
    phone: z.string().optional()
});

const loginUserInput = z.object({
    email: z.string(),
    password: z.string()
});

const changePasswordInput = z.object({
    userId: z.string(),
    oldPassword: z.string(),
    newPassword: z.string().min(6)
});

const getUserInfoInput = z.object({
    userId: z.string().optional()
});

const getOrderDetailInput = z.object({
    orderId: z.string()
});

const checkOrderStatusInput = z.object({
    orderId: z.string(),
    userId: z.string()
});

const checkStockInput = z.object({
    productId: z.string()
});

const updateStockInput = z.object({
    productId: z.string(),
    stock: z.number().min(0)
});

const setCategoryInput = z.object({
    name: z.string(),
    description: z.string().optional(),
});

const updateCategoryInput = z.object({
    categoryId: z.string(),
    name: z.string().optional(),
    description: z.string().optional(),
});

const deleteCategoryInput = z.object({
    categoryId: z.string()
});

const getAllCategoriesInput = z.object({});

const getProductsByCategoryInput = z.object({
    categoryId: z.string()
});

const createPaymentInput = z.object({
    userId: z.string(),
    email: z.string().email(),
    phone: z.string(),
    name: z.string(),
    address: z.string(),
    totalAmount: z.number(),
    basket: z.array(z.object({
        productId: z.string(),
        name: z.string(),
        price: z.number(),
        quantity: z.number()
    }))
});

const getUserProfileInput = z.object({
    user: z.object({
        userId: z.string()
    })
});

const updateUserProfileInput = z.object({
    user: z.object({
        userId: z.string()
    }),
    name: z.string(),
    surname: z.string(),
    phone: z.string().optional(),
    address: z.string().optional()
});

const getUserOrdersInput = z.object({
    user: z.object({
        userId: z.string()
    })
});

const guestOrderInput = z.object({
  name: z.string().min(1),
  phone: z.string().min(5),
  email: z.string().email(),
  address: z.string().min(5),
  products: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().min(1),
    })
  )
});

const createSingleOrderInput = z.object({
  userId: z.string(),
  productId: z.string(),
  quantity: z.number().min(1),
  address: z.string().min(5)
});

const getOrderByIdInput =z.object({
    orderId:z.string()
})

const getProductInput = z.object({
  productId: z.string().min(1, "productId boş olamaz.")
});

module.exports = {
    setProductInput,
    updateProductInput,
    deleteProductInput,
    addToCartInput,
    createOrderInput,
    listOrdersInput,
    updateOrderStatusInput,
    getAllProductsInput,
    registerUserInput,
    loginUserInput,
    changePasswordInput,
    getUserInfoInput,
    getOrderDetailInput,
    checkOrderStatusInput,
    checkStockInput,
    updateStockInput,
    setCategoryInput,
    updateCategoryInput,
    deleteCategoryInput,
    getAllCategoriesInput,
    getProductsByCategoryInput,
    createPaymentInput,
    getUserProfileInput,
    updateUserProfileInput,
    getUserOrdersInput,
    guestOrderInput,
    createSingleOrderInput,
    getOrderByIdInput,
    getProductInput
}
