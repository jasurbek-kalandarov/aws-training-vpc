import { s3 } from '../aws/sdk';

async function getListOfBucketsContainingName(name: string) {
  const data = await s3.listBuckets().promise();
  const cloudxBuckets = data!.Buckets!.filter(bucket => bucket?.Name?.includes(name));
  return cloudxBuckets;
}

export default getListOfBucketsContainingName;