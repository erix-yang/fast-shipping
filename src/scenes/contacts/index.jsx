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

const Contacts = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [contacts, setContacts] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('add'); // 'add' or 'edit'
  const [selectedContact, setSelectedContact] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    zip_code: '',
    registrar_id: ''
  });

  useEffect(() => {
    getContacts();
  }, []);

  const getContacts = async () => {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*');
      
      if (error) throw error;
      setContacts(data);
    } catch (error) {
      console.error('Error fetching contacts:', error.message);
    }
  };

  const columns = [
    { field: "id", headerName: "ID", flex: 0.5 },
    { 
      field: "registrar_id",
      headerName: "Registrar ID"
    },
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      cellClassName: "name-column--cell",
    },
    {
      field: "age",
      headerName: "Age",
      type: "number",
      headerAlign: "left",
      align: "left",
    },
    {
      field: "phone",
      headerName: "Phone Number",
      flex: 1,
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1,
    },
    {
      field: "address",
      headerName: "Address",
      flex: 1,
    },
    {
      field: "city",
      headerName: "City",
      flex: 1,
    },
    {
      field: "zip_code",
      headerName: "Zip Code",
      flex: 1,
    },
  ];

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAdd = () => {
    setDialogMode('add');
    setFormData({
      name: '',
      age: '',
      phone: '',
      email: '',
      address: '',
      city: '',
      zip_code: '',
      registrar_id: ''
    });
    setOpenDialog(true);
  };

  const handleEdit = () => {
    const selectedRows = document.getElementsByClassName('Mui-selected');
    if (selectedRows.length !== 1) {
      alert('Please select one row to edit');
      return;
    }
    const selectedId = selectedRows[0].getAttribute('data-id');
    const contactToEdit = contacts.find(contact => contact.id === parseInt(selectedId));
    setSelectedContact(contactToEdit);
    setFormData(contactToEdit);
    setDialogMode('edit');
    setOpenDialog(true);
  };

  const handleDelete = async () => {
    const selectedRows = document.getElementsByClassName('Mui-selected');
    if (selectedRows.length === 0) {
      alert('Please select at least one row to delete');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete the selected contacts?')) {
      const selectedIds = Array.from(selectedRows).map(row => parseInt(row.getAttribute('data-id')));
      
      try {
        const { error } = await supabase
          .from('contacts')
          .delete()
          .in('id', selectedIds);

        if (error) throw error;
        
        await getContacts(); // Refresh the data
        alert('Contacts deleted successfully');
      } catch (error) {
        console.error('Error deleting contacts:', error.message);
        alert('Error deleting contacts');
      }
    }
  };

  const handleSubmit = async () => {
    try {
      const formattedData = {
        name: formData.name,
        age: formData.age ? parseInt(formData.age) : null,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        city: formData.city,
        zip_code: formData.zip_code,
        registrar_id: formData.registrar_id ? parseInt(formData.registrar_id) : null
      };

      if (dialogMode === 'add') {
        const { error } = await supabase
          .from('contacts')
          .insert([formattedData]);
        
        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }
        alert('Contact added successfully');
      } else {
        const { error } = await supabase
          .from('contacts')
          .update(formattedData)
          .eq('id', selectedContact.id);
        
        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }
        alert('Contact updated successfully');
      }
      
      setOpenDialog(false);
      await getContacts(); // Refresh the data
    } catch (error) {
      console.error('Error saving contact:', error);
      alert(`Error saving contact: ${error.message}`);
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
        title="CONTACTS"
        subtitle="List of Contacts for Future Reference"
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
          "& .name-column--cell": {
            color: colors.greenAccent[300],
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
          "& .MuiCheckbox-root": {
            color: `${colors.greenAccent[200]} !important`,
          },
          "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
            color: `${colors.grey[100]} !important`,
          },
          "& .MuiButton-root": {
            margin: "0 8px",
          },
        }}
      >
        <DataGrid
          rows={contacts}
          columns={columns}
          components={{ 
            Toolbar: CustomToolbar 
          }}
          checkboxSelection
        />
      </Box>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>{dialogMode === 'add' ? 'Add New Contact' : 'Edit Contact'}</DialogTitle>
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
              name="name"
              label="Name"
              value={formData.name}
              onChange={handleInputChange}
            />
            <TextField
              name="age"
              label="Age"
              type="number"
              value={formData.age}
              onChange={handleInputChange}
            />
            <TextField
              name="phone"
              label="Phone"
              value={formData.phone}
              onChange={handleInputChange}
            />
            <TextField
              name="email"
              label="Email"
              value={formData.email}
              onChange={handleInputChange}
            />
            <TextField
              name="address"
              label="Address"
              value={formData.address}
              onChange={handleInputChange}
            />
            <TextField
              name="city"
              label="City"
              value={formData.city}
              onChange={handleInputChange}
            />
            <TextField
              name="zip_code"
              label="Zip Code"
              value={formData.zip_code}
              onChange={handleInputChange}
            />
            <TextField
              name="registrar_id"
              label="Registrar ID"
              type="number"
              value={formData.registrar_id}
              onChange={handleInputChange}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>{dialogMode === 'add' ? 'Add' : 'Save'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Contacts;
