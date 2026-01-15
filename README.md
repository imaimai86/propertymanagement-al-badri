# propertymanagement-al-badri
Light weight property management website, using google app script to load data from google sheets and save leads to google sheets

## Setup Instructions

### AWS S3 CORS Configuration (Required for Image Uploads)

To enable image uploads from the mobile app and website, you must configure CORS (Cross-Origin Resource Sharing) on your S3 bucket.

**Steps:**
1. Go to [AWS S3 Console](https://s3.console.aws.amazon.com/)
2. Select your bucket (e.g., `albadri-demo`)
3. Click the **Permissions** tab
4. Scroll to **Cross-origin resource sharing (CORS)**
5. Click **Edit**
6. Paste the following configuration:

```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
        "AllowedOrigins": ["*"],
        "ExposeHeaders": ["ETag", "x-amz-request-id"],
        "MaxAgeSeconds": 3000
    }
]
```

7. Click **Save changes**

**Note:** The `"AllowedOrigins": ["*"]` configuration is permissive and suitable for development. For production, replace with your specific domain(s):
```json
"AllowedOrigins": ["https://yourdomain.com", "https://www.yourdomain.com"]
```

## Multi-Image Support
- **Thumbnail**: Stored in `thumbnail` column (single image URL).
- **Gallery**: Stored in `images` column (JSON array of URLs).
- **Deletion**: Soft-delete implemented. Deleted images are moved to `assets/props-imgs-deleted/` and removed from the active listing.
- **Upload Flow**: Images are first uploaded to `uploaded_assets/`, then moved to `assets/props-imgs/prop-id-{id}/` when the property is saved.
