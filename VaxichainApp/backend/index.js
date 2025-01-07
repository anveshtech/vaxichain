import { server } from "./src/app.js"
import { dbConnect } from "./src/db.js"

const PORT = process.env.PORT || 3000

dbConnect()
  .then(() => {
    console.log("mongoose ready")
    server.listen(PORT, () => {
      console.log(`Server Ready at port ${PORT}`)
    })
  })
  .catch((error) => {
    console.log(error)
  })
