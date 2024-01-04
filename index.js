const express = require('express');
const { ShareServiceClient } = require("@azure/storage-file-share");
require('dotenv').config();

const SHARE_NAME = process.env.SHARE_NAME || 'fs0';

const app = express();
const port = process.env.PORT || 3000;

const storageAccountConnectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const shareServiceClient = ShareServiceClient.fromConnectionString(storageAccountConnectionString);
const shareClient = shareServiceClient.getShareClient(SHARE_NAME);

app.get('/:directory/:filename', async (req, res) => {
  try {
    const { directory, filename } = req.params

    if (!directory || !filename) {
      return res.status(400).send({ message: 'Invalid directory or filename.' })
    }

    const directoryClient = shareClient.getDirectoryClient(directory);
    const fileClient = directoryClient.getFileClient(filename);

    const doesFileExists = await fileClient.exists();

    if (!doesFileExists) {
      return res.status(404).send({ message: 'File not found.' });
    }

    const downloadBlockFileResponse = await fileClient.download();
    downloadBlockFileResponse.readableStreamBody.pipe(res);
  } catch (error) {
    res.status(500).send({ error });
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
