const express = require('express');
const { ShareServiceClient } = require("@azure/storage-file-share");

const SHARE_NAME = 'fs0';

require('dotenv').config();

const app = express();
const port = 3000;

const storageAccountConnectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const shareServiceClient = ShareServiceClient.fromConnectionString(storageAccountConnectionString);

app.get('/:directory/:filename', async (req, res) => {
  try {
    const directory = req.params.directory;
    const fileName = req.params.filename;
    const shareClient = shareServiceClient.getShareClient(SHARE_NAME);
    const fileClient = shareClient.getDirectoryClient(directory).getFileClient(fileName);

    const doesShareClientExists = await shareClient.exists();
    const doesFileExists = await fileClient.exists();

    if (!doesShareClientExists || !doesFileExists) {
      return res.status(404).send("Container or file not found");
    }

    const downloadBlockBlobResponse = await fileClient.download();
    downloadBlockBlobResponse.readableStreamBody.pipe(res);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error retrieving file");
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
