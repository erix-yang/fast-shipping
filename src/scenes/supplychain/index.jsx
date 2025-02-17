import { Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Tab, Tabs } from "@mui/material";
import { DataGrid, GridToolbar, GridToolbarContainer } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import { useTheme } from "@mui/material";
import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import Header from "../../components/Header";
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
// import ItemTab from './ItemTab';
// import ManagementTab from './ManagementTab';

const OrderDetailsDialog = ({ order, onClose }) => {
  const [itemTabData, setItemTabData] = useState([]);
  const [managementTabData, setManagementTabData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState(order);

  useEffect(() => {
    const fetchData = async () => {
      if (order) {
        setLoading(true);
        setError(null);
        try {
          await fetchItemTabData(order.id);
          await fetchManagementTabData(order.id);
        } catch (err) {
          setError('Oops! Something went wrong.');
          console.error('Error fetching data:', err);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchData();
  }, [order]);

  const fetchItemTabData = async (productionOrderId) => {
    const { data, error } = await supabase
      .from('itemtab')
      .select('*')
      .eq('productionorderid', productionOrderId);
    if (error) throw error;
    setItemTabData(data);
  };

  const fetchManagementTabData = async (productionOrderId) => {
    const { data, error } = await supabase
      .from('managementtab') // 假设您有这个表
      .select('*')
      .eq('productionorderid', productionOrderId);
    if (error) throw error;
    setManagementTabData(data);
  };

  const handleItemEdit = (newData) => {
    setItemTabData(newData);
  };

  const handleManagementEdit = (newData) => {
    setManagementTabData(newData);
  };

  const handleSubmit = async () => {
    // 提交 Item Tab 和 Management Tab 的数据到 Supabase
    // 这里需要实现更新逻辑
  };

  const itemColumns = [
    { field: "itemid", headerName: "Item ID", flex: 1 },
    { field: "itemname", headerName: "Item Name", flex: 1, editable: true },
    { field: "qty", headerName: "Quantity", flex: 1, editable: true },
    { field: "measure", headerName: "Measure", flex: 1, editable: true },
    { field: "stage", headerName: "Stage", flex: 1, editable: true },
    { field: "notes", headerName: "Notes", flex: 1, editable: true },
    { field: "docs", headerName: "Docs", flex: 1, editable: true },
  ];

  const managementColumns = [
    { field: "managementField", headerName: "Management Field", flex: 1, editable: true },
    // 添加其他管理字段
  ];

  return (
    <Dialog open={true} onClose={onClose}>
      <DialogTitle>Order Details</DialogTitle>
      <DialogContent>
        <Tabs>
          <Tab label="Item Tab" />
          <Tab label="Management Tab" />
        </Tabs>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p>{error}</p>
        ) : (
          <div>
            <h3>Item Tab</h3>
            <DataGrid
              rows={itemTabData}
              columns={itemColumns}
              onCellEditCommit={(params) => {
                const updatedRows = itemTabData.map((row) =>
                  row.itemid === params.id ? { ...row, [params.field]: params.value } : row
                );
                handleItemEdit(updatedRows);
              }}
              autoHeight
              pageSize={5}
            />
            <h3>Management Tab</h3>
            <DataGrid
              rows={managementTabData}
              columns={managementColumns}
              onCellEditCommit={(params) => {
                const updatedRows = managementTabData.map((row) =>
                  row.managementField === params.id ? { ...row, [params.field]: params.value } : row
                );
                handleManagementEdit(updatedRows);
              }}
              autoHeight
              pageSize={5}
            />
          </div>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button onClick={handleSubmit}>Save</Button>
      </DialogActions>
    </Dialog>
  );
};

const Supplychain = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [supplyChainData, setSupplyChainData] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('add'); // 'add' or 'edit'
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [formData, setFormData] = useState({
    ProductionOrder: '',
    Stage: '',
    Location: '',
    Onsite: '',
    PlannedHours: '',
    ActualHours: '',
    Notes: ''
  });
  const [openOrderDialog, setOpenOrderDialog] = useState(false);
  const [itemTabData, setItemTabData] = useState([]);

  useEffect(() => {
    getSupplyChainData();
  }, []);

  const getSupplyChainData = async () => {
    try {
      const { data, error } = await supabase
        .from('supplychain')
        .select('*');
      
      if (error) {
        console.error('Error fetching supply chain data:', error);
        throw error;
      }
      setSupplyChainData(data);
    } catch (error) {
      console.error('Error fetching supply chain data:', error.message);
    }
  };

  const handleOrderClick = (order) => {
    setSelectedOrder(order);
    setOpenOrderDialog(true);
  };

  const columns = [
    { field: "id", headerName: "ID", flex: 0.5 },
    { 
      field: "productionorder",
      headerName: "Production Order",
      renderCell: (params) => (
        <Button onClick={() => handleOrderClick(params.row)}>
          {params.value}
        </Button>
      )
    },
    { 
      field: "stage",
      headerName: "Stage",
      flex: 1,
    },
    { 
      field: "location",
      headerName: "Location",
      flex: 1,
    },
    { 
      field: "onsite",
      headerName: "Onsite",
      flex: 1,
      type: 'date',
    },
    { 
      field: "plannedhours",
      headerName: "Planned Hours",
      flex: 1,
      type: 'number',
    },
    { 
      field: "actualhours",
      headerName: "Actual Hours",
      flex: 1,
      type: 'number',
    },
    { 
      field: "notes",
      headerName: "Notes",
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
      ProductionOrder: '',
      Stage: '',
      Location: '',
      Onsite: '',
      PlannedHours: '',
      ActualHours: '',
      Notes: ''
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
    const orderToEdit = supplyChainData.find(order => order.id === parseInt(selectedId));
    setSelectedOrder(orderToEdit);
    setFormData(orderToEdit);
    setDialogMode('edit');
    setOpenDialog(true);
  };

  const handleDelete = async () => {
    const selectedRows = document.getElementsByClassName('Mui-selected');
    if (selectedRows.length === 0) {
      alert('Please select at least one row to delete');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete the selected orders?')) {
      const selectedIds = Array.from(selectedRows).map(row => parseInt(row.getAttribute('data-id')));
      
      try {
        const { error } = await supabase
          .from('SupplyChain')
          .delete()
          .in('id', selectedIds);

        if (error) throw error;
        
        await getSupplyChainData();
        alert('Orders deleted successfully');
      } catch (error) {
        console.error('Error deleting orders:', error.message);
        alert('Error deleting orders');
      }
    }
  };

  const handleSubmit = async () => {
    try {
      const formattedData = {
        ProductionOrder: formData.ProductionOrder,
        Stage: formData.Stage,
        Location: formData.Location,
        Onsite: formData.Onsite,
        PlannedHours: formData.PlannedHours ? parseInt(formData.PlannedHours) : null,
        ActualHours: formData.ActualHours ? parseInt(formData.ActualHours) : null,
        Notes: formData.Notes
      };

      if (dialogMode === 'add') {
        const { error } = await supabase
          .from('SupplyChain')
          .insert([formattedData]);
        
        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }
        alert('Order added successfully');
      } else {
        const { error } = await supabase
          .from('SupplyChain')
          .update(formattedData)
          .eq('id', selectedOrder.id);
        
        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }
        alert('Order updated successfully');
      }
      
      setOpenDialog(false);
      await getSupplyChainData();
    } catch (error) {
      console.error('Error saving order:', error);
      alert(`Error saving order: ${error.message}`);
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

  const fetchItemTabData = async (productionOrderId) => {
    try {
      const { data, error } = await supabase
        .from('itemtab')
        .select('*')
        .eq('productionorderid', productionOrderId);

      if (error) {
        console.error('Error fetching item tab data:', error);
        throw error;
      }
      setItemTabData(data);
    } catch (error) {
      console.error('Error fetching item tab data:', error.message);
    }
  };

  const handleItemTabClick = () => {
    if (selectedOrder) {
      fetchItemTabData(selectedOrder.id);
    }
  };

  return (
    <Box m="20px">
      <Header
        title="SUPPLY CHAIN"
        subtitle="List of Supply Chain Orders"
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
          rows={supplyChainData}
          columns={columns}
          components={{ 
            Toolbar: CustomToolbar 
          }}
          checkboxSelection
        />
      </Box>
      {openOrderDialog && (
        <OrderDetailsDialog 
          order={selectedOrder} 
          onClose={() => setOpenOrderDialog(false)} 
        />
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>{dialogMode === 'add' ? 'Add New Order' : 'Edit Order'}</DialogTitle>
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
              name="ProductionOrder"
              label="Production Order"
              value={formData.ProductionOrder}
              onChange={handleInputChange}
            />
            <TextField
              name="Stage"
              label="Stage"
              value={formData.Stage}
              onChange={handleInputChange}
            />
            <TextField
              name="Location"
              label="Location"
              value={formData.Location}
              onChange={handleInputChange}
            />
            <TextField
              name="Onsite"
              label="Onsite"
              type="date"
              value={formData.Onsite}
              onChange={handleInputChange}
            />
            <TextField
              name="PlannedHours"
              label="Planned Hours"
              type="number"
              value={formData.PlannedHours}
              onChange={handleInputChange}
            />
            <TextField
              name="ActualHours"
              label="Actual Hours"
              type="number"
              value={formData.ActualHours}
              onChange={handleInputChange}
            />
            <TextField
              name="Notes"
              label="Notes"
              value={formData.Notes}
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

export default Supplychain;
