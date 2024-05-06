import express from "express";
import cors from "cors"; // para crear la tipica api del inicio
import multer from "multer";
import csvToJson from "convert-csv-to-json";

const app = express();
const port = process.env.PORT ?? 3000;
const storage = multer.memoryStorage();
const upload = multer({ storage });
let userData: Array<Record<string, string>> = []; // array de objectos que tienen una key o un value que tiene strings
app.use(cors()); // enable cors

// endpoint:
app.post("/api/files", upload.single("file"), async (req, res) => {
  // 1.extract file from request
  const { file } = req;
  // 2.validate that we have a file
  if (!file) {
    return res.status(500).json({ message: "File is required" });
  }
  // 3. validate the mime type(csv)
  if (file.mimetype != "text/csv") {
    return res.status(500).json({ message: "File must be CSV" });
  }
  let json: Array<Record<string, string>> = [];
  // 4. transform file buffer to string
  try {
    const rawCsv = Buffer.from(file.buffer).toString("utf-8");
    console.log(rawCsv);
    // 5. transfrom string csv to JSON
    json = csvToJson.fieldDelimiter(",").csvStringToJson(rawCsv);
  } catch (error) {
    return res.status(500).json({ message: "Error parsing the file" });
  }
  // 6. save the json to db
  userData = json;
  // 7. return 200 with the message and the json
  return res
    .status(200)
    .json({ data: userData, message: "El archivo se cargó correctamente" });
});

// endpoint:
app.get("/api/users", async (req, res) => {
  //1. extract the query param 'q' from the request
  const { q } = req.query;
  //2. validate that we have the query param
  if (!q) {
    return res.status(500).json({
      message: "Query param `q` is required",
    });
  }
  if (Array.isArray(q)) {
    res.status(500).json({
      message: "Query param `q`must be a string",
    });
  }
  //3. filter the data from the db with the query param
  const search = q.toString().toLowerCase();
  const filteredData = userData.filter((row) => {
    return Object.values(row).some((value) =>
      value.toLowerCase().includes(search),
    );
  });
  //4 return 200 with the filtered data
  return res.status(200).json({ data: filteredData });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
