const { v4 } = require("uuid");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { chroma } = require("chromadb");
var admin = require("firebase-admin");
const express = require("express");
const axios = require("axios");
const pdfParse = require("pdf-parse");
//const PdfReader = require("pdfreader");
const app = express();
app.use(express.static("public"));
const serviceAccount = require("./service-account.json");
const { PDFDocument } = require("pdf-lib");
//const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

const port = 3000;
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const storage = admin.storage();
async function extractPdfText(url) {
    try{
        const response = await axios.get(url, { responseType: "arraybuffer" });
        const data = await pdfParse(response.data);
        return data.text;
    }
    catch(error){
        console.error(error)
    }
}

function formatArrayElements(arr) {
  const formattedElements = [];
  for (let i = 0; i < arr.length; i++) {
    formattedElements.push(`book_${i + 1}`);
  }
  return formattedElements;
}

app.get("/home", async (req, res) => {
  const finance_books = [
    "https://firebasestorage.googleapis.com/v0/b/financial-advisor-llm.appspot.com/o/LLM%20Sources%2FInvestopedia.pdf?alt=media&token=ecd64c82-f518-4592-80e5-be6a73543998",
    "https://firebasestorage.googleapis.com/v0/b/financial-advisor-llm.appspot.com/o/LLM%20Sources%2FDean%20Paxson%2C%20Douglas%20Wood%2C%20Blackwell%20Encyclopedic%20Dictionary%20of%20Finance%20(1997).pdf?alt=media&token=55ad60d9-8fd1-44b8-88fc-63d5076781be",
    "https://firebasestorage.googleapis.com/v0/b/financial-advisor-llm.appspot.com/o/LLM%20Sources%2FA-plain-English-guide-to-financial-terms.pdf?alt=media&token=ea04f56f-9e42-43f3-be2e-61d62c516574",
  ];
  const knowledge = []
  const cc = new chroma.ChromaClient({ path: "http://localhost:8000" });
  await cc.reset();

  for(const book of finance_books){
    const book_text = await extractPdfText(book)
    knowledge.push(book_text);
  }
  const google = new chroma.GoogleGenerativeAiEmbeddingFunction({
    googleApiKey: "<APIKEY>",
  });
  const collection = await cc.createCollection({
    name: "financial-info",
    embeddingFunction: google,
  });

  await collection.add({
    ids: formatArrayElements(knowledge),
    documents: knowledge,
  });

  res.sendFile(__dirname + "/public/index.html");
});

app.get("/", (req, res) => {
  res.send("Hello, World!");
  res.sendFile(__dirname + "/public/index.html");
});

app.listen(port, async() => {
  console.log(`Example app listening on port ${port}`);
});

module.exports = app;
