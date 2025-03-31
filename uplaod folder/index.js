// Backend (server/index.js)
const express = require("express");
const multer = require("multer");
const fs = require("fs-extra");
const path = require("path");
const unzipper = require("unzipper");
const cors = require("cors");  // Import CORS middleware
const app = express();

app.use(cors({ origin: "http://localhost:3000" })); // Allow frontend to access API

// Configure Multer for uploading ZIP files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    if (!file.originalname) {
      return cb(new Error("Invalid file"), false);
    }
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (!file.originalname) {
      console.log("Skipping empty file...");
      return cb(null, false);
    }
    cb(null, true);
  }
});

app.post("/upload-folder", upload.single("folderZip"), async (req, res) => {
  if (!req.file || !req.body.folderName) {
    return res.status(400).json({ error: "Missing file or folder name" });
  }

  const folderName = req.body.folderName;
  const zipPath = req.file.path;
  const extractPath = path.join(__dirname, "uploads", folderName);

  try {
    console.log("Extracting:", zipPath, "to", extractPath);
    await fs.ensureDir(extractPath); // Ensure directory exists

    const zipStream = fs.createReadStream(zipPath)
      .pipe(unzipper.Extract({ path: extractPath }));

    zipStream.on("close", async () => {
      try {
        await fs.unlink(zipPath); // Delete ZIP after extraction
        console.log("Deleted ZIP file:", zipPath);
        res.json({ message: "Folder extracted successfully!", path: extractPath });
      } catch (unlinkError) {
        console.error("Error deleting ZIP:", unlinkError);
        res.status(500).json({ error: "Extraction completed, but ZIP deletion failed" });
      }
    });

    zipStream.on("error", async (err) => {
      console.error("Extraction error:", err);
      await fs.unlink(zipPath); // Ensure ZIP is deleted on failure
      res.status(500).json({ error: "Extraction failed, ZIP deleted" });
    });

  } catch (error) {
    console.error("Server error:", error);
    await fs.unlink(zipPath); // Ensure ZIP is deleted on unexpected error
    res.status(500).json({ error: "Server error, ZIP deleted" });
  }
});

app.listen(8000, () => console.log("Server running on port 8000"));


// const express = require('express');
// const multer = require('multer');
// const cors = require('cors');
// const path = require('path');
// const fs = require('fs');

// const app = express();
// app.use(cors());

// // Enhanced storage configuration for nested folders
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     try {
//       // Extract the full path from the originalname
//       // Format: "relative/path/to/file|filename.ext"
//       const fullPath = file.originalname;
//       const separatorIndex = fullPath.lastIndexOf('|');
      
//       let relativePath = '';
//       let filename = fullPath;
      
//       if (separatorIndex !== -1) {
//         relativePath = fullPath.substring(0, separatorIndex);
//         filename = fullPath.substring(separatorIndex + 1);
//       }
      
//       const uploadPath = path.join(__dirname, 'uploads', relativePath);
      
//       // Create all necessary directories recursively
//       fs.mkdirSync(uploadPath, { recursive: true });
      
//       cb(null, uploadPath);
//     } catch (err) {
//       console.error('Error creating directory:', err);
//       cb(err);
//     }
//   },
//   filename: (req, file, cb) => {
//     const fullPath = file.originalname;
//     const separatorIndex = fullPath.lastIndexOf('|');
//     const filename = separatorIndex !== -1 
//       ? fullPath.substring(separatorIndex + 1) 
//       : fullPath;
//     cb(null, filename);
//   }
// });

// const upload = multer({ storage });

// app.post('/upload', upload.array('files'), (req, res) => {
//   try {
//     if (!req.files || req.files.length === 0) {
//       return res.status(400).json({ success: false, message: 'No files uploaded' });
//     }
    
//     res.json({ 
//       success: true, 
//       message: 'Folder structure uploaded successfully',
//       fileCount: req.files.length
//     });
//   } catch (err) {
//     console.error('Upload error:', err);
//     res.status(500).json({ success: false, message: 'Error uploading folder structure' });
//   }
// });

// const PORT = 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// const express = require('express');
// const multer = require('multer');
// const cors = require('cors');
// const path = require('path');
// const fs = require('fs');

// const app = express();
// app.use(cors());

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     try {
//       const fullPath = file.originalname;
//       const separatorIndex = fullPath.lastIndexOf('|');
      
//       let relativePath = '';
//       let filename = fullPath;
      
//       if (separatorIndex !== -1) {
//         relativePath = fullPath.substring(0, separatorIndex);
//         filename = fullPath.substring(separatorIndex + 1);
//       }
      
//       const uploadPath = path.join(__dirname, 'uploads', relativePath);
//       fs.mkdirSync(uploadPath, { recursive: true });
//       cb(null, uploadPath);
//     } catch (err) {
//       console.error('Error creating directory:', err);
//       cb(err);
//     }
//   },
//   filename: (req, file, cb) => {
//     const fullPath = file.originalname;
//     const separatorIndex = fullPath.lastIndexOf('|');
//     const filename = separatorIndex !== -1 
//       ? fullPath.substring(separatorIndex + 1) 
//       : fullPath;
//     cb(null, filename);
//   }
// });

// const upload = multer({ storage });

// app.post('/upload', upload.array('files'), (req, res) => {
//   try {
//     if (!req.files || req.files.length === 0) {
//       return res.status(400).json({ success: false, message: 'No files uploaded' });
//     }
    
//     res.json({ 
//       success: true, 
//       message: 'Folder structure uploaded successfully',
//       fileCount: req.files.length,
//       uploadedFiles: req.files.map(f => ({
//         originalname: f.originalname,
//         path: f.path,
//         size: f.size
//       }))
//     });
//   } catch (err) {
//     console.error('Upload error:', err);
//     res.status(500).json({ success: false, message: 'Error uploading folder structure' });
//   }
// });

// const PORT = 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));