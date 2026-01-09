# Property Details Page & Google Sheets CMS Implementation Plan

This plan outlines the technical approach used to implement a dynamic property details page and a "serverless" Headless CMS using Google Sheets.

## Technical Architecure

- **Frontend**: Static HTML/JS hosted on AWS S3.
- **Data Source**: Google Sheets (serving as a CMS).
- **Backend Link**: Google Apps Script acting as a JSON middleware (GET) and Lead capture (POST).

## Proposed Changes (Completed)

### [Data] Assets and Google Sheets
- **Folder Structure**: Property images are organized in `assets/props-imgs/prop-id-[id]/`.
- **Properties Sheet**: A spreadsheet with columns for `id`, `title`, `price`, `images`, `amenities`, `long_desc`, etc.
- **Conversion**: An Apps Script translates the sheet rows into a clean JSON array for the website.

### [UI/UX] Property Details Page
- **Template**: `property-details.html` with modern, mobile-responsive layout.
- **Carousel**: A custom JavaScript carousel handling multiple high-resolution images.
- **Contact Modal**: A lead-generation form that sends data to the Google Sheet.

### [API] Google Apps Script Middleware
The following script is deployed as a Web App to handle data flow securely:

```javascript
function doGet(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Properties");
    if (!sheet) throw new Error("Sheet 'Properties' not found");
    
    var rows = sheet.getDataRange().getValues();
    var headers = rows[0];
    var properties = [];
    
    for (var i = 1; i < rows.length; i++) {
      var prop = {};
      for (var j = 0; j < headers.length; j++) {
        var val = rows[i][j];
        if (headers[j] === "images" || headers[j] === "amenities") {
          prop[headers[j]] = val ? val.toString().split(",").map(s => s.trim()) : [];
        } else {
          prop[headers[j]] = val;
        }
      }
      properties.push(prop);
    }
    
    return ContentService.createTextOutput(JSON.stringify(properties))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error("Invalid request: No POST data found. Note: You cannot test doPost by clicking 'Run' in the editor.");
    }

    var data = JSON.parse(e.postData.contents);
    
    // Validation
    var required = ["name", "email", "contactNumber", "propId"];
    var missing = [];
    required.forEach(function(field) {
      if (!data[field]) missing.push(field);
    });

    if (missing.length > 0) {
      throw new Error("Missing required fields: " + missing.join(", "));
    }

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Leads");
    if (!sheet) throw new Error("Sheet 'Leads' not found");

    sheet.appendRow([
      new Date(), 
      data.name, 
      data.email, 
      data.contactNumber, 
      data.propId, 
      data.propTitle || "N/A", 
      data.message || ""
    ]);

    return ContentService.createTextOutput("Success")
      .setMimeType(ContentService.MimeType.TEXT);

  } catch (err) {
    return ContentService.createTextOutput("Error: " + err.message)
      .setMimeType(ContentService.MimeType.TEXT);
  }
}
```

## Verification Summary
- **Navigation**: Verified that listing cards pass the correct `?id=` to the details page.
- **Responsiveness**: Tested the grid layout and carousel on mobile and desktop views.
- **Form Submission**: Verified successful `fetch` requests (mock and real) for lead capture.
