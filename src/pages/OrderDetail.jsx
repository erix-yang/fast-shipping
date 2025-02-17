import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, CircularProgress, Divider } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { supabase } from '../supabaseClient';

const OrderDetail = () => {
  const { id } = useParams();
  const [itemTabData, setItemTabData] = useState([]);
  const [managementTabData, setManagementTabData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        await fetchItemTabData(id);
        await fetchManagementTabData(id);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const fetchItemTabData = async (productionOrderId) => {
    try {
      const { data, error } = await supabase
        .from('itemtab')
        .select('*')
        .eq('productionorderid', productionOrderId);
      if (error) throw error;
      console.log('Item Tab Data:', data);
      setItemTabData(data);
    } catch (error) {
      console.error('Error fetching item tab data:', error.message);
      throw error;
    }
  };

  const fetchManagementTabData = async (productionOrderId) => {
    try {
      const { data, error } = await supabase
        .from('managementtab')
        .select('*')
        .eq('productionorderid', productionOrderId);
      if (error) throw error;
      console.log('Management Tab Data:', data);
      setManagementTabData(data);
    } catch (error) {
      console.error('Error fetching management tab data:', error.message);
      throw error;
    }
  };

  const itemColumns = [
    { field: "itemid", headerName: "Item ID", flex: 1 },
    { field: "itemname", headerName: "Item Name", flex: 1 },
    { field: "qty", headerName: "Quantity", flex: 1 },
    { field: "measure", headerName: "Measure", flex: 1 },
    { field: "stage", headerName: "Stage", flex: 1 },
    { field: "notes", headerName: "Notes", flex: 1 },
    { field: "docs", headerName: "Docs", flex: 1 },
  ];

  const managementColumns = [
    { field: "itemid", headerName: "Item ID", flex: 1 },
    { field: "itemname", headerName: "Item Name", flex: 1 },
    { field: "shippingmethod", headerName: "Shipping Method", flex: 1 },
    { field: "courier", headerName: "Courier", flex: 1 },
    { field: "expecteddate", headerName: "Expected Date", flex: 1, type: 'date' },
  ];

  return (
    <Box m="20px">
      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Typography variant="h6" color="error">
          Oops! Something went wrong: {error}
        </Typography>
      ) : (
        <>
          <Typography variant="h4" gutterBottom>
            Item Tab
          </Typography>
          <div style={{ height: 200, width: '100%' }}>
            <DataGrid
              rows={itemTabData}
              columns={itemColumns}
              pageSize={5}
              autoHeight
              getRowId={(row) => row.itemid}
            />
          </div>
          <Divider sx={{ my: 2, boxShadow: 1 }} />
          <Typography variant="h4" gutterBottom>
            Management Tab
          </Typography>
          <div style={{ height: 400, width: '100%' }}>
            <DataGrid
              rows={managementTabData}
              columns={managementColumns}
              pageSize={5}
              autoHeight
              getRowId={(row) => row.itemid}
            />
          </div>
        </>
      )}
    </Box>
  );
};

export default OrderDetail; 