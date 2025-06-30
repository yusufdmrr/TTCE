// index.js

const app = require('./app')  // app.js’den sadece app al
const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`)
})
