const { BlobServiceClient } = require('@azure/storage-blob');

/**
 * storageDeaults
 * @summary static object with some defaults
 */
exports.storageDefaults = {
  blobContainerName: 'functions-data',
  peersFileName: 'peers-status.json',
  peersDefaultContent: {
    'Primary-IPv4': true,
    'Secondary-IPv4': true,
  },
};

/**
 * getBlobServiceClient
 * @summary async helper that instantiates/returns blob service client
 * @param  {string} connectionString
 * @returns {BlobServiceClient} Azure blob service client
 */
exports.getBlobServiceClient = async (connectionString) => {
  const blobServiceClient = await BlobServiceClient.fromConnectionString(
    connectionString,
  );
  return blobServiceClient;
};

/**
 * getBlobContainerClient
 * @summary async helper that instantiates/returns blob storage container client
 * @param  {BlobServiceClient} blobServiceClient
 * @param  {string} blobContainerName
 * @returns {ContainerClient} Azure blob container client
 */
exports.getBlobContainerClient = async (
  blobServiceClient,
  blobContainerName,
) => {
  let containerClient;

  // try connecting to container and create one if it doesn't already exist
  try {
    containerClient = await blobServiceClient.getContainerClient(
      blobContainerName,
    );
  } catch (error) {
    await blobServiceClient.createContainer(blobContainerName);
    containerClient = await blobServiceClient.getContainerClient(
      blobContainerName,
    );
  }

  return containerClient;
};

/**
 * getBlockClient
 * @summary async helper for instantiating/returning a block blob client
 * @param  {ContainerClient} containerClient
 * @param  {string} blobName
 * @returns {BlockBlobClient} Azure block blob client
 */
exports.getBlockClient = async (containerClient, blobName) => {
  const blockBlobClient = await containerClient.getBlockBlobClient(blobName);
  return blockBlobClient;
};

/**
 * uploadFile
 * @summary async function that uploads SFInfo export files to Azure blob stoage
 * @example await uploadFile(storageConnectionString, containerName, JSON.stringify(fileContent))
 * @param  {string} storageConnectionString
 * @param  {string} blobContainerName
 * @param  {any} fileContent
 * @param  {string} fileName
 * @param  {string} [storageTier=Hot] Hot, Cold, or Archive
 * @returns {Object} response from blob upload
 */
exports.uploadFile = async ({
  storageConnectionString,
  blobContainerName,
  fileContent,
  fileName,
  storageTier = 'Hot',
}) => {
  const uploadContent =
    typeof fileContent === 'string' ? fileContent : JSON.stringify(fileContent);
  const blobServiceClient = await exports.getBlobServiceClient(
    storageConnectionString,
  );
  const containerClient = await exports.getBlobContainerClient(
    blobServiceClient,
    blobContainerName,
  );
  const blockBlobClient = await containerClient.getBlockBlobClient(fileName);
  const uploadBlobResponse = await blockBlobClient.upload(
    uploadContent,
    Buffer.byteLength(uploadContent),
    {
      tier: storageTier,
    },
  );
  return {
    fileName,
    ...uploadBlobResponse,
  };
};

/**
 * getBlobContent
 * @summary async function for returning the text content of a specific blob
 * @example await getBlobContent(containerClient, '20210101-sfinfo-export.json')
 * @param  {ContainerClient} containerClient
 * @param  {string} blobContainerName
 * @returns {string} content of specified blab
 */
exports.getBlobContent = async (containerClient, blobName) => {
  const blockBlobClient = await exports.getBlockClient(
    containerClient,
    blobName,
  );
  const downloadBlockBlobResponse = await blockBlobClient.download(0);
  const exportStream = await downloadBlockBlobResponse.readableStreamBody;

  const chunks = [];
  for await (const chunk of exportStream) {
    chunks.push(chunk);
  }
  const fullContent = Buffer.concat(chunks).toString();

  return fullContent;
};
