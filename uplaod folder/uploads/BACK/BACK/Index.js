const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs").promises;
const AdmZip = require("adm-zip");

const app = express();
const folderTemplateRoutes = require("./routes/folderTemplateRoutes");
const dbconnect = require("./database/db");
const multer = require("multer");
const File = require("./FileModel");


// Middleware
app.use(cors());
app.use(express.json());

app.use("/uploads", express.static("uploads"));


// Database connection
dbconnect();

// Folder Template Routes
app.use("/foldertemp", folderTemplateRoutes);


// Set up multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Log and get destination path from the request body
    const destinationPath = req.body.destinationPath || "uploads"; // Default to 'uploads' if not provided
    console.log(destinationPath);

    // Set the destination path
    cb(null, destinationPath);
  },
  filename: (req, file, cb) => {
    // Use the original file name, but ensure it is safe for filenames by handling spaces and special characters
    const fileName = file.originalname.replace(/\s+/g, "_"); // Replace spaces with underscores
    cb(null, fileName); // Save with the original file name
  },
});

const upload = multer({ storage: storage });

app.post("/uploadfile", upload.single("file"), async (req, res) => {
  // Extract the file path and permissions from the request
  let targetPath = req.body.destinationPath;
  
  // Default permissions if not provided by user
  const defaultPermissions = {
    canView: true,
    canDownload: true,
    canDelete: false,
    canUpdate: false,
  };

  // Use user-provided permissions or fall back to defaults
  const permissions = req.body.permissions || defaultPermissions;

  // Replace all occurrences of '//' with '/'
  targetPath = targetPath.replace(/\/\//g, "/");

  console.log("Vinayak");

  if (!targetPath) {
    return res.status(400).send({ message: "Path is required in the request body." });
  }

  if (!req.file) {
    return res.status(400).send({ message: "No file uploaded." });
  }

  // Create a new file document with permissions
  const newFile = new File({
    filename: req.file.filename,
    filePath: targetPath,
    permissions: {
      canView: permissions.canView,
      canDownload: permissions.canDownload,
      canDelete: permissions.canDelete,
      canUpdate: permissions.canUpdate,
    },
  });

  try {
    // Save the file and permissions to MongoDB
    await newFile.save();
    res.status(200).send({
      message: "File uploaded successfully!",
      filePath: `/${targetPath}/${req.file.filename}`,
      permissions: newFile.permissions,
    });
  } catch (error) {
    res.status(500).send({ message: "Error saving file to database.", error: error.message });
  }
});


// Fetch all folders and files
app.get("/allFolders/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const uploadsPath = path.join(__dirname, `./uploads/FolderTemplates/${id}`);

    const getAllItems = async (dir) => {
      const items = await fs.readdir(dir);
      const itemsPromises = items.map(async (item) => {
        const itemPath = path.join(dir, item);
        const stats = await fs.stat(itemPath);
        if (stats.isDirectory()) {
          const subItems = await getAllItems(itemPath);
          return { folder: item, contents: subItems };
        } else {
          return { file: item };
        }
      });
      return Promise.all(itemsPromises);
    };

    const folderData = await getAllItems(uploadsPath);
    res.status(200).json({ folders: folderData });
  } catch (error) {
    console.error("Error fetching all folders:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
// API route to get file details by _id
app.get('/api/file/:id', async (req, res) => {
  
  try {
    const file = await File.findById(req.params.id);
    
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }
    
    res.json({
      _id: file._id,
      filename: file.filename,
      filePath: file.filePath,
      createdAt: file.createdAt,
      updatedAt: file.updatedAt
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Route to get all files
app.get('/api/files', async (req, res) => {
  
  try {
    const files = await File.find({}); // Fetch all files

    res.status(200).json({
      success: true,
      count: files.length,
      data: files,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});


// Start the server
const port = process.env.PORT || 8005;
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
