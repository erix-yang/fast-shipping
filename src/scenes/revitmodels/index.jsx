import { Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from "@mui/material";
import { DataGrid, GridToolbar, GridToolbarContainer } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import { useTheme } from "@mui/material";
import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import Header from "../../components/Header";
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

const RevitModels = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [revitModelsData, setRevitModelsData] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('add'); // 'add' or 'edit'
  const [selectedModel, setSelectedModel] = useState(null);
  const [formData, setFormData] = useState({
    project_name: '',
    file_name: '',
    file_path: '',
    update_time: new Date().toISOString().split('T')[0]
  });
  const [fileToUpload, setFileToUpload] = useState(null);

  useEffect(() => {
    getRevitModelsData();
  }, []);

  const getRevitModelsData = async () => {
    try {
      const { data, error } = await supabase
        .from('revitmodels')
        .select('*');
      
      if (error) {
        console.error('Error fetching revit models data:', error);
        throw error;
      }
      setRevitModelsData(data || []);
    } catch (error) {
      console.error('Error fetching revit models data:', error.message);
    }
  };

  const downloadFile = async (filePath) => {
    try {
      const { data, error } = await supabase.storage
        .from('revit-models') // Replace with your actual bucket name
        .download(filePath);
      
      if (error) throw error;
      
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = filePath.split('/').pop();
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading file:', error.message);
      alert('Error downloading file');
    }
  };

  const columns = [
    { field: "id", headerName: "ID", flex: 0.5 },
    { 
      field: "project_name",
      headerName: "Project Name",
      flex: 1,
    },
    { 
      field: "file_name",
      headerName: "File Name",
      flex: 1,
    },
    { 
      field: "update_time",
      headerName: "Update Time",
      flex: 1,
      type: 'date',
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      renderCell: (params) => (
        <Button
          variant="contained"
          color="primary"
          size="small"
          startIcon={<FileDownloadIcon />}
          onClick={() => downloadFile(params.row.file_path)}
        >
          Download
        </Button>
        
      ),
    },
  ];

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    setFileToUpload(e.target.files[0]);
  };

  const handleAdd = () => {
    setDialogMode('add');
    setFormData({
      project_name: '',
      file_name: '',
      file_path: '',
      update_time: new Date().toISOString().split('T')[0]
    });
    setFileToUpload(null);
    setOpenDialog(true);
  };

  const handleEdit = () => {
    const selectedRows = document.getElementsByClassName('Mui-selected');
    if (selectedRows.length !== 1) {
      alert('Please select one row to edit');
      return;
    }
    const selectedId = selectedRows[0].getAttribute('data-id');
    const modelToEdit = revitModelsData.find(model => model.id === parseInt(selectedId));
    setSelectedModel(modelToEdit);
    setFormData({
      project_name: modelToEdit.project_name || '',
      file_name: modelToEdit.file_name || '',
      file_path: modelToEdit.file_path || '',
      update_time: modelToEdit.update_time || new Date().toISOString().split('T')[0]
    });
    setDialogMode('edit');
    setOpenDialog(true);
  };

  const handleDelete = async () => {
    const selectedRows = document.getElementsByClassName('Mui-selected');
    if (selectedRows.length === 0) {
      alert('Please select at least one row to delete');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete the selected models?')) {
      const selectedIds = Array.from(selectedRows).map(row => parseInt(row.getAttribute('data-id')));
      
      // First, delete files from storage for each selected model
      for (const id of selectedIds) {
        const model = revitModelsData.find(m => m.id === id);
        if (model && model.file_path) {
          try {
            const { error: storageError } = await supabase.storage
              .from('revit-models') // Replace with your actual bucket name
              .remove([model.file_path]);
            
            if (storageError) {
              console.error('Error deleting file from storage:', storageError);
            }
          } catch (error) {
            console.error('Error deleting file from storage:', error.message);
          }
        }
      }
      
      // Then delete database records
      try {
        const { error } = await supabase
          .from('revitmodels')
          .delete()
          .in('id', selectedIds);

        if (error) throw error;
        
        await getRevitModelsData();
        alert('Models deleted successfully');
      } catch (error) {
        console.error('Error deleting models:', error.message);
        alert('Error deleting models');
      }
    }
  };

  const handleSubmit = async () => {
    try {
      let filePath = formData.file_path;
      
      // Upload file if selected
      if (fileToUpload) {
        const fileName = `${Date.now()}_${fileToUpload.name}`;
        const storagePath = `models/${fileName}`;
        
        console.log('准备上传的文件:', fileToUpload);
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('revit-models') // Replace with your actual bucket name
          .upload(storagePath, fileToUpload);
        
        if (uploadError) {
          console.error('Error uploading file:', uploadError);
          throw uploadError;
        }
        
        filePath = storagePath;
      }
      
      const formattedData = {
        project_name: formData.project_name,
        file_name: fileToUpload ? fileToUpload.name : formData.file_name,
        file_path: filePath,
        update_time: formData.update_time
      };

      if (dialogMode === 'add') {
        const { data, error } = await supabase
          .from('revitmodels')
          .insert([formattedData]);
        
        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }
        alert('Model added successfully');
      } else {
        // If editing and a new file is uploaded, delete the old file
        if (fileToUpload && selectedModel.file_path) {
          try {
            const { error: deleteError } = await supabase.storage
              .from('revit-models') // Replace with your actual bucket name
              .remove([selectedModel.file_path]);
            
            if (deleteError) {
              console.error('Error deleting old file:', deleteError);
            }
          } catch (error) {
            console.error('Error deleting old file:', error.message);
          }
        }
        
        const { data, error } = await supabase
          .from('revitmodels')
          .update(formattedData)
          .eq('id', selectedModel.id);
        
        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }
        alert('Model updated successfully');
      }
      
      setOpenDialog(false);
      await getRevitModelsData();
    } catch (error) {
      console.error('Error saving model:', error);
      alert(`Error saving model: ${JSON.stringify(error)}`);
    }
  };

  const CustomToolbar = () => {
    return (
      <GridToolbarContainer>
        <GridToolbar />
        <Button
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAdd}
        >
          Add
        </Button>
        <Button
          color="secondary"
          startIcon={<EditIcon />}
          onClick={handleEdit}
        >
          Edit
        </Button>
        <Button
          color="error"
          startIcon={<DeleteIcon />}
          onClick={handleDelete}
        >
          Delete
        </Button>
      </GridToolbarContainer>
    );
  };

  return (
    <Box m="20px">
      <Header
        title="REVIT MODELS"
        subtitle="Manage Your Revit Models"
      />
      <Box
        m="40px 0 0 0"
        height="75vh"
        sx={{
          "& .MuiDataGrid-root": {
            border: "none",
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "none",
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: colors.blueAccent[700],
            borderBottom: "none",
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: colors.primary[400],
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "none",
            backgroundColor: colors.blueAccent[700],
          },
        }}
      >
        <DataGrid
          rows={revitModelsData}
          columns={columns}
          components={{ 
            Toolbar: CustomToolbar 
          }}
          checkboxSelection
        />
      </Box>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>{dialogMode === 'add' ? 'Add New Revit Model' : 'Edit Revit Model'}</DialogTitle>
        <DialogContent>
          <Box
            component="form"
            sx={{
              '& .MuiTextField-root': { m: 1, width: '25ch' },
            }}
            noValidate
            autoComplete="off"
          >
            <TextField
              name="project_name"
              label="Project Name"
              value={formData.project_name}
              onChange={handleInputChange}
              fullWidth
              required
              margin="normal"
            />
            {dialogMode === 'edit' && !fileToUpload && (
              <TextField
                name="file_name"
                label="File Name"
                value={formData.file_name}
                disabled
                fullWidth
                margin="normal"
              />
            )}
            <Box sx={{ m: 1 }}>
              <label htmlFor="file-upload">
                <Button
                  variant="contained"
                  component="span"
                >
                  {fileToUpload ? 'Change File' : 'Upload Revit File'}
                </Button>
              </label>
              <input
                id="file-upload"
                type="file"
                accept=".rvt,.rfa,.rte,.rft"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              {fileToUpload && (
                <Box sx={{ mt: 1 }}>
                  Selected file: {fileToUpload.name}
                </Box>
              )}
            </Box>
            <TextField
              name="update_time"
              label="Update Time"
              type="date"
              value={formData.update_time}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            disabled={dialogMode === 'add' && !fileToUpload}
          >
            {dialogMode === 'add' ? 'Add' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RevitModels;
