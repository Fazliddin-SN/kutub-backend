require("dotenv").config();

const { Storage } = require("@google-cloud/storage");
const { version } = require("joi");

// to create a connecttion with google cloud storage
const storage = new Storage({
  projectId: process.env.GCS_BUCKET_NAME || "libbookimages",
  keyFilename:
    process.env.GOOGLE_APPLICATION_CREDENTIALS ||
    "my-book-covers-bf2b863936e7.json",
});

const bucketName = process.env.GCS_BUCKET_NAME || "libbookimages";
const location = process.env.GCS_BUCKET_LOCATION || "US";
const storageClass = process.env.GCS_STORAGE_CLASS || "STANDARD";

// Get a reference to a Cloud Storage bucket.
//@param name — Name of the bucket.
//@param options — Configuration object.
const bucket = storage.bucket(bucketName);

// this function helps to ensure that The Bucket exists if it doesnot, it will create a bucket with the "bucketName"
async function ensureBucket() {
  const [exists] = await storage.bucket(bucketName).exists();
  if (!exists) {
    console.log(`Bucket "${bucketName}" not found-creating it...`);
    await storage.createBucket(bucketName, {
      location,
      storageClass,
    });
    console.log(
      `Bucket "${bucketName}" created (${location}, ${storageClass}).`
    );
  } else {
    console.log(`Bucket "${bucketName}" already exists.`);
  }
}

// Get the metadata of this object.
async function getBucketMetadata() {
  const [metadata] = await storage.bucket(bucketName).getMetadata();
  return {
    name: metadata.name,
    location: metadata.location,
    storageClass: metadata.storageClass,
    url: `https://storage.googleapis.com/${metadata.name}`,
    created: metadata.timeCreated,
    versioning: metadata.versioning?.enabled || false,
    lifecycleRules: metadata.lifecycle?.rule || [],
  };
}

// this func returns all the buckets names
async function listBuckets() {
  const [buckets] = await storage.getBuckets();
  return buckets.map((b) => b.name);
}

// deleting the old image files from the cloud storage
async function deleteFromGCS(filename) {
  await bucket
    .file(filename)
    .delete()
    .catch((err) => {
      console.warn(`Failed to delete ${filename}: `, err.message);
    });
}

module.exports = {
  storage,
  bucketName,
  ensureBucket,
  getBucketMetadata,
  listBuckets,
  deleteFromGCS,
};
