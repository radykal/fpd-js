import AWS from 'aws-sdk'

fabric.node.setters.s3 = function(value){
    return new Promise( resolve => {
        this.s3config = value;

        fabric.node.s3 = new AWS.S3({
            accessKeyId: value.key,
            secretAccessKey: value.secret
        });

        fabric.node.s3.listBuckets({}, (err, data) => {
            if (err) {
                console.log(err, err.stack);
            } // an error occurred
            else {
                let bucketInfo = data.Buckets.find(bucket => bucket.Name === value.bucket);

                if (bucketInfo) {
                    resolve();
                }
                if (!bucketInfo) {
                    fabric.node.s3.createBucket({
                        Bucket: value.bucket,
                        CreateBucketConfiguration: {
                            LocationConstraint: value.region
                        }
                    }, (err, data) => {
                        if (err) {
                            console.log(err, err.stack);
                        } else {
                            console.log('Bucket Created Successfully', data.Location);
                            resolve();
                        }
                    });
                }
            }
        });
    });
};

fabric.node.uploadToS3 = function(key, buffer){
    return new Promise(resolve => {

        // Setting up S3 upload parameters
        // Uploading files to the bucket
        fabric.node.s3.upload({
            Bucket: this.s3config.bucket,
            Key: key, // File name you want to save as in S3
            Body: buffer
        }, function (err, data) {
            if (err) {
                throw err;
            }
            resolve(data.Location);
        });
    });
};
fabric.node.removeFromS3 = function(key){

    fabric.node.s3.deleteObject({
        Bucket: this.s3config.bucket,
        Key: key
    }, function(err, data) {
        if (err) {
            console.log(err, err.stack);
        }
        else     {
            console.log('deleted');
        }
    });
}


