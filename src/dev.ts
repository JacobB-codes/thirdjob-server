import app from "./api/index";
import dotenv from "dotenv";

dotenv.config();

const port = process.env.PORT || 4000;

app.listen(port, () => {
  console.log(`started on ${port}`);
});
