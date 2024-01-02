const express = require('express');
const { BlobServiceClient } = require("@azure/storage-blob");

require('dotenv').config();

const app = express();
const port = 3000;

const storageAccountConnectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const blobServiceClient = BlobServiceClient.fromConnectionString(storageAccountConnectionString);

app.get('/:container/:filename', async (req, res) => {
  try {
    const containerName = req.params.container;
    const fileName = req.params.filename;
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blobClient = containerClient.getBlobClient(fileName);

    const doesContainerExists = await containerClient.exists();
    const doesBlobExists = await blobClient.exists();

    if (!doesContainerExists || !doesBlobExists) {
      return res.status(404).send("Container or file not found");
    }

    const downloadBlockBlobResponse = await blobClient.download();
    downloadBlockBlobResponse.readableStreamBody.pipe(res);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error retrieving file");
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
