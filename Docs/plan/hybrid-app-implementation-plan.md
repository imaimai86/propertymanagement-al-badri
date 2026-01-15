# Implementation Plan: Hybrid Property & Lead Manager

## Goal Description
Build a **Cross-Platform** application (Web, iOS, Android) to manage Properties and Leads.
- **Data Source**: Google Sheets.
- **Backend**: **Split API Strategy** (Public Read-Only / Private Admin).
- **Storage**: **AWS S3** (Managed via Presigned URLs).
- **Frontend**: **Expo (React Native)**.

## User Review Required

> [!TIP]
> **S3 Upload Strategy (Presigned URLs)**
> To upload images securely without exposing your AWS Keys in the mobile app code:
> 1.  **Request**: App asks Apps Script: *"I want to upload `house.jpg`"*.
> 2.  **Sign**: Apps Script (using stored Keys) creates a temporary **Presigned Upload URL** valid for 5 minutes.
> 3.  **Upload**: App uploads the file **directly to S3** using that URL.
> 4.  **Confirm**: App sends the final S3 URL back to Apps Script to save in the Google Sheet.
> *Benefit*: Fast uploads, bypasses Apps Script 50MB limit, credentials stay safe on the server.

> [!WARNING]
> **Prerequisites**
> -   **AWS Bucket Policy**: Must allow CORS (Cross-Origin Resource Sharing) so the Web/Mobile app can upload directly. 
>   *(I will provide the CORS configuration JSON).*
> -   **IAM User**: Create an AWS IAM User with `s3:PutObject` permission and save the Keys in **Apps Script Project Properties** (not in the code).

## Proposed Changes

### 1. Project Structure
```text
/management-portal
  /admin-api (Apps Script)
  /mobile-app (Expo)
```

### 2. Backend: Admin API (Apps Script)
#### Endpoints
-   `action: 'login'` -> returns `auth_token`.
-   `action: 'getLeads'` -> returns leads list.
-   `action: 'lockLead'` -> locks lead for agent.
-   `action: 'getUploadUrl'` (NEW):
    -   Input: `auth_token`, `filename`, `mimeType`, `propertyId`.
    -   Logic: Generates AWS V4 Signature for a `PUT` request.
    -   Path: `assets/props-imgs/prop-id-${propertyId}/${filename}`.
    -   Output: `{ uploadUrl: "https://s3.amazonaws.com/...", publicUrl: "..." }`.

### 3. Frontend (Expo / React Native)
#### Image Upload Flow
1.  **Pick Image**: Use `expo-image-picker`.
2.  **Get URL**: Call `getUploadUrl` API.
3.  **Upload**: `fetch(uploadUrl, { method: 'PUT', body: blob })`.
4.  **Save**: Add `publicUrl` to the Property form data.

## Verification Plan

### Automated Tests
-   Verify generated Presigned URL allows upload (using a test script).

### Manual Verification
1.  **CORS Test**: Upload from the Web version of the app ensuring no CORS errors.
2.  **Flow**: Pick Image -> Upload -> Verify file appears in S3 Bucket.
