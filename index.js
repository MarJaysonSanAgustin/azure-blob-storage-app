#!/usr/bin/env node
require('dotenv').config();

const { BlobServiceClient } = require("@azure/storage-blob")

const storageAccountConnectionString = process.env.AZURE_STORAGE_CONNECTION_STIRNG;
const blobServiceClient = BlobServiceClient.fromConnectionString(storageAccountConnectionString);

async function main() {
  const containerName = 'photos';
  const containerClient = blobServiceClient.getContainerClient(containerName);
  const doesContainerExists = await containerClient.exists();
  if (!doesContainerExists) {
    const createContainerResponse = await containerClient.createIfNotExists();
    console.log(`Create container ${containerName} successfully`, createContainerResponse.succeeded);
  } else {
    console.log(`Container ${containerName} aleady exists`)
  }

  const fileName = 'docs-and-friends-selfie-stick.png';
  const blockBlobClient = containerClient.getBlockBlobClient(fileName);
  blockBlobClient.uploadFile(fileName);

  let blobs = containerClient.listBlobsFlat();
  let blob = await blobs.next();
  while(!blob.done) {
    console.log(`${blob.value.name} --> Created: ${blob.value.properties.createdOn}  | Size: ${blob.value.properties.contentLength}`);
    blob = await blobs.next();
  }
}

main();
