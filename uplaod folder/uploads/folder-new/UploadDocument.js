
import "./foldertemp.css";
import { FaRegFolderClosed } from "react-icons/fa6";
import { Link } from "react-router-dom";
import { FaTimes } from "react-icons/fa";
import FetchFolder from "./FetchFolder";

import { BsThreeDotsVertical } from "react-icons/bs";
import { useEffect, useState, useRef } from "react";
import { FcFolder } from "react-icons/fc";
import { FcOpenedFolder } from "react-icons/fc";
import axios from "axios";
import { FaRegFilePdf, FaRegImage } from "react-icons/fa6";
import { PiMicrosoftWordLogoFill } from "react-icons/pi";
import { AiFillFileUnknown } from "react-icons/ai";
import { toast } from "react-toastify";
import { BsFiletypeXlsx } from "react-icons/bs";
import { Button, IconButton, List, ListItem, Divider, Box, Typography, Drawer } from "@mui/material";
const UploadDocument = ({ isDocumentForm, setIsDocumentForm,  templateId,handleUploadFormClose }) => {
  const API_KEY = process.env.REACT_APP_API_IP;
 

  return (
    <Drawer
      anchor="right"
      open={isDocumentForm}
      onClose={handleUploadFormClose}
      PaperProps={{
        sx: {
          width: 800,
        },
      }}
    >
      <div>
        documrnt upload
      </div>
       <Box sx={{ padding: "16px" }}>{/*
      
       

        {/* Buttons */}
        <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
          <Button variant="contained" color="primary">
            Upload
          </Button>
          <Button variant="outlined" onClick={handleUploadFormClose}>
            Cancel
          </Button>
        </Box>
      </Box> 
    </Drawer>
  );
};

export default UploadDocument;
