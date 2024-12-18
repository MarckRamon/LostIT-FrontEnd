import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Menu,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import axiosInstance from '../axiosInstance';

const initialFormState = {
  itemName: '',
  category: '',
  description: '',
  location: '',
  status: 'Unclaimed',
  date: '',
};

const initialLocationState = {
  locationBuilding: '',
  locationFloor: '',
};

const initialCategoryState = {
  categoryName: '',
};

function Inventory() {
  const [items, setItems] = useState([]);
  const [openMainDialog, setOpenMainDialog] = useState(false);
  const [openLocationDialog, setOpenLocationDialog] = useState(false);
  const [openCategoryDialog, setOpenCategoryDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState(initialFormState);
  const [locationData, setLocationData] = useState(initialLocationState);
  const [categoryData, setCategoryData] = useState(initialCategoryState);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');

  const handleCategoryChange = (event) => {
    const value = event.target.value;
    console.log('Selected Category value: ', value);
    setSelectedCategory(value === '' ? null : value);
  };

  const handleLocationChange = (event) => {
    const value = event.target.value;
    console.log('Selected Location value: ', value);
    setSelectedLocation(value === '' ? null : value);
  };



  useEffect(() => {
    fetchItems();
    fetchCategories();
    fetchLocations();
  }, []);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/api/items/getAllItems');
      const transformedItems = response.data.map(item => ({
        itemId: item.itemId || item.id,
        itemName: item.itemName,
        categoryId: item.categoryId || (item.category && item.category.id) || (item.category && item.category.categoryId),
        locationId: item.locationId || (item.location && item.location.id) || (item.location && item.location.locationId),
        description: item.description,
        status: item.status,
        date: item.date || '',
        category: item.category,
        location: item.location
      }));
      setItems(transformedItems);
      setError('');
    } catch (error) {
      console.error("Error fetching items:", error);
      setError("Failed to fetch items. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axiosInstance.get('/api/categories/getAllCategories');
      console.log('Categories response:', response.data);
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setError("Failed to fetch categories.");
    }
  };

  const fetchLocations = async () => {
    try {
      const response = await axiosInstance.get('/api/locations/getAllLocations');
      console.log('Locations response:', response.data);
      setLocations(response.data);
    } catch (error) {
      console.error("Error fetching locations:", error);
      setError("Failed to fetch locations.");
    }
  };

  const getCategoryName = (item) => {
    if (!item.category) return 'N/A';
    return item.category.categoryName || 'N/A';
  };


  const getLocationName = (item) => {
    if (!item.location) return 'N/A';
    return item.location.locationBuilding && item.location.locationFloor
      ? `${item.location.locationBuilding} - ${item.location.locationFloor}`
      : 'N/A';
  };

  /* handlers */

  const handleOpenDialog = (item = null) => {
    setError('');
    if (item) {
      setFormData({
        itemName: item.itemName || '',
        category: item.categoryId || item.category?.id || '',
        description: item.description || '',
        location: item.locationId || item.location?.id || '',
        status: item.status || 'Unclaimed',
        date: item.date || '',
      });
      setEditingId(item.itemId);
    } else {
      setFormData(initialFormState);
      setEditingId(null);
    }
    setOpenMainDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenMainDialog(false);
    setFormData(initialFormState);
    setEditingId(null);
    setError('');
  };

  const handleAddItem = async () => {
    if (!formData.itemName || !formData.category || !formData.location) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    setError('');

    try {
      const requestData = {
        itemName: formData.itemName.trim(),
        description: formData.description.trim(),
        status: formData.status,
        date: formData.date,
        category: { categoryId: parseInt(formData.category) },
        location: { locationId: parseInt(formData.location) }
      };

      await axiosInstance.post('/api/items/addItem', requestData);
      setSuccessMessage('Item added successfully!');
      await fetchItems();
      setOpenMainDialog(false);
      setFormData(initialFormState);
    } catch (error) {
      console.error("Error adding item:", error);
      setError(error.response?.data?.message || "Error adding item. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditItem = async () => {
    if (!formData.itemName || !formData.category || !formData.location) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    setError('');

    try {
      const requestData = {
        itemName: formData.itemName.trim(),
        description: formData.description.trim(),
        status: formData.status,
        date: formData.date,
        category: { categoryId: parseInt(formData.category) },
        location: { locationId: parseInt(formData.location) }
      };

      await axiosInstance.put(`/api/items/updateItem/${editingId}`, requestData);
      setSuccessMessage('Item updated successfully!');
      await fetchItems();
      setOpenMainDialog(false);
      setFormData(initialFormState);
      setEditingId(null);
    } catch (error) {
      console.error("Error updating item:", error);
      setError(error.response?.data?.message || "Error updating item. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        setLoading(true);
        await axiosInstance.delete(`/api/items/deleteItem/${itemId}`);
        await fetchItems();
        setSuccessMessage('Item deleted successfully!');
      } catch (error) {
        console.error("Error deleting item:", error);
        setError(error.response?.data?.message || "Error deleting item. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category? This will also remove all items associated with this category.')) {
      try {
        setLoading(true);
        await axiosInstance.delete(`/api/categories/deleteCategory/${categoryId}`);
        await fetchCategories();

        // If the deleted category was the current selected category, reset it
        if (Number(formData.category) === Number(categoryId)) {
          setFormData({ ...formData, category: '' });
        }

        setSuccessMessage('Category deleted successfully!');
      } catch (error) {
        console.error("Error deleting category:", error);
        setError(error.response?.data?.message || "Error deleting category. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeleteLocation = async (locationId) => {
    if (window.confirm('Are you sure you want to delete this location? This will also remove all items associated with this location.')) {
      try {
        setLoading(true);
        await axiosInstance.delete(`/api/locations/deleteLocation/${locationId}`);
        await fetchLocations();
        
        // If the deleted location was the current selected location, reset it
        if (Number(formData.location) === Number(locationId)) {
          setFormData({ ...formData, location: '' });
        }
        
        setSuccessMessage('Location deleted successfully!');
      } catch (error) {
        console.error("Error deleting location:", error);
        setError(error.response?.data?.message || "Error deleting location. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };


  const filteredItems = items.filter(item => {
    const matchesSearchTerm =
      item.itemName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase());
  
    const matchesCategory = selectedCategory === null || selectedCategory === ''
      ? true
      : Number(item.categoryId) === Number(selectedCategory);
  
    const matchesLocation = selectedLocation === null || selectedLocation === ''
      ? true
      : Number(item.locationId) === Number(selectedLocation);
  
    const matchesStatus = selectedStatus === '' 
      ? ['Claimed', 'Unclaimed'].includes(item.status)
      : item.status === selectedStatus;
  
    return matchesSearchTerm && matchesCategory && matchesLocation && matchesStatus;
  });

  const handleOpenLocationDialog = () => {
    setLocationData(initialLocationState);
    setOpenLocationDialog(true);
  };

  const handleCloseLocationDialog = () => {
    setLocationData(initialLocationState);
    setOpenLocationDialog(false);
  };

  const handleOpenCategoryDialog = () => {
    setCategoryData(initialCategoryState);
    setOpenCategoryDialog(true);
  };

  const handleCloseCategoryDialog = () => {
    setCategoryData(initialCategoryState);
    setOpenCategoryDialog(false);
  };

  const handleAddLocation = async () => {
    if (!locationData.locationBuilding || !locationData.locationFloor) {
      setError("Please fill in all location fields");
      return;
    }

    try {
      setLoading(true);
      await axiosInstance.post('/api/locations/createLocation', locationData);
      await fetchLocations();
      setSuccessMessage('Location added successfully!');
      handleCloseLocationDialog();
    } catch (error) {
      console.error("Error adding location:", error);
      setError(error.response?.data?.message || "Error adding location. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!categoryData.categoryName) {
      setError("Please fill in the category name");
      return;
    }

    try {
      setLoading(true);
      await axiosInstance.post('/api/categories/createCategory', categoryData);
      await fetchCategories();
      setSuccessMessage('Category added successfully!');
      handleCloseCategoryDialog();
    } catch (error) {
      console.error("Error adding category:", error);
      setError(error.response?.data?.message || "Error adding category. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {successMessage && (
        <Box sx={{ mb: 2, p: 2, bgcolor: 'success.light', color: 'success.contrastText', borderRadius: 1 }}>
          {successMessage}
        </Box>
      )}

      {error && (
        <Box sx={{ mb: 2, p: 2, bgcolor: 'error.light', color: 'error.contrastText', borderRadius: 1 }}>
          {error}
        </Box>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <TextField
          placeholder="Search items"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ width: 300 }}
        />
        <FormControl sx={{ minWidth: 120, mx: 1 }}>
          <InputLabel>Category</InputLabel>
          <Select
            value={selectedCategory || null}
            onChange={handleCategoryChange}
            label="Category"
          >
            <MenuItem value="">
              <em>All</em>
            </MenuItem>
            {categories.map((category) => (
              <MenuItem
                key={category.id || category.categoryId}
                value={category.id || category.categoryId}
              >
                {category.name || category.categoryName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 120, mx: 1 }}>
          <InputLabel>Location</InputLabel>
          <Select
            value={selectedLocation || null}
            onChange={handleLocationChange}
            label="Location"
          >
            <MenuItem value="">
              <em>All</em>
            </MenuItem>
            {locations.map((location) => (
              <MenuItem
                key={location.id || location.locationId}
                value={location.id || location.locationId}
              >
                {location.name || `${location.locationBuilding} - ${location.locationFloor}` || location.locationName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 120, mx: 1 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            label="Status"
          >
            <MenuItem value="">
              <em>All</em>
            </MenuItem>
            <MenuItem value="Unclaimed">Unclaimed</MenuItem>
            <MenuItem value="Claimed">Claimed</MenuItem>
          </Select>
        </FormControl>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenMainDialog(true)}
          disabled={loading}
        >
          Add New Item
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Item ID</TableCell>
              <TableCell>Item Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Date Added</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  {loading ? 'Loading...' : 'No items found'}
                </TableCell>
              </TableRow>
            ) : (
              filteredItems.map((item) => (
                <TableRow key={item.itemId}>
                  <TableCell>{item.itemId}</TableCell>
                  <TableCell>{item.itemName || 'N/A'}</TableCell>
                  <TableCell>{item.description || 'N/A'}</TableCell>
                  <TableCell>{getCategoryName(item)}</TableCell>
                  <TableCell>{getLocationName(item)}</TableCell>
                  <TableCell>{item.status || 'N/A'}</TableCell>
                  <TableCell>{item.date || 'N/A'}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpenDialog(item)} disabled={loading}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(item.itemId)} disabled={loading}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>


      {/* Add Item Dialog or Main Dialog */}
      <Dialog
        open={openMainDialog}
        disableBackdropClick
        disableEscapeKeyDown
        onClose={(event, reason) => {
          if (reason !== "backdropClick" && reason !== "escapeKeyDown") {
            handleCloseDialog();
          }
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{editingId ? 'Edit Item' : 'Add New Item'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Item Name"
            fullWidth
            value={formData.itemName}
            onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
            required
            sx={{ mb: 2, mt: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="category-label">Category</InputLabel>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Select
                labelId="category-label"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
                label="Category"
                sx={{ flexGrow: 1, mr: 1 }}
              >
                {categories.map((category) => (
                  <MenuItem
                    key={category.id || category.categoryId}
                    value={category.id || category.categoryId}
                  >
                    {category.name || category.categoryName}
                  </MenuItem>
                ))}
              </Select>
              <Button
                onClick={handleOpenCategoryDialog}
                variant="contained"
                color="primary"
                sx={{ mr: 1 }}
                disabled={loading}
              >
                Add
              </Button>
              <Button
                onClick={() => {
                  const categoryToDelete = formData.category;
                  if (categoryToDelete) {
                    handleDeleteCategory(categoryToDelete);
                  } else {
                    setError("Please select a category to delete");
                  }
                }}
                variant="contained"
                color="error"
                disabled={loading || !formData.category}
              >
                Delete
              </Button>
            </Box>
          </FormControl>

          <TextField
            label="Description"
            fullWidth
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            sx={{ mb: 2 }}
          />

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="location-label">Location</InputLabel>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Select
                labelId="location-label"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
                label="Location"
                sx={{ flexGrow: 1, mr: 1 }}
              >
                {locations.map((location) => (
                  <MenuItem
                    key={location.id || location.locationId}
                    value={location.id || location.locationId}
                  >
                    {location.name || `${location.locationBuilding} - ${location.locationFloor}` || location.locationName}
                  </MenuItem>
                ))}
              </Select>
              <Button
                onClick={handleOpenLocationDialog}
                variant="contained"
                color="primary"
                sx={{ mr: 1 }}
                disabled={loading}
              >
                Add
              </Button>
              <Button
                onClick={() => {
                  const locationToDelete = formData.location;
                  if (locationToDelete) {
                    handleDeleteLocation(locationToDelete);
                  } else {
                    setError("Please select a location to delete");
                  }
                }}
                variant="contained"
                color="error"
                disabled={loading || !formData.location}
              >
                Delete
              </Button>
            </Box>
          </FormControl>

          <FormControl sx={{ minWidth: 120, mx: 1 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              label="Status"
              disabled
            >
              <MenuItem value="Unclaimed">Unclaimed</MenuItem>
              <MenuItem value="Claimed">Claimed</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Date Added"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="secondary">
            Cancel
          </Button>
          <Button onClick={editingId ? handleEditItem : handleAddItem} variant="contained" color="primary" disabled={loading}>
            {editingId ? 'Save Changes' : 'Add Item'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Category Dialog */}
      <Dialog
        open={openCategoryDialog}
        onClose={(event, reason) => {
          if (reason !== "backdropClick" && reason !== "escapeKeyDown") {
            handleCloseCategoryDialog();
          }
        }}
        disableBackdropClick
        disableEscapeKeyDown
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add New Category</DialogTitle>
        <DialogContent>
          <TextField
            label="Category Name"
            fullWidth
            value={categoryData.categoryName}
            onChange={(e) => setCategoryData({ ...categoryData, categoryName: e.target.value })}
            required
            sx={{ mb: 2, mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCategoryDialog} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleAddCategory} variant="contained" color="primary" disabled={loading}>
            Add Category
          </Button>
        </DialogActions>
      </Dialog>

      {/* Location Dialog */}
      <Dialog
        open={openLocationDialog}
        onClose={(event, reason) => {
          if (reason !== "backdropClick" && reason !== "escapeKeyDown") {
            handleCloseLocationDialog();
          }
        }}
        disableBackdropClick
        disableEscapeKeyDown
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add New Location</DialogTitle>
        <DialogContent>
          <TextField
            label="Building"
            fullWidth
            value={locationData.locationBuilding}
            onChange={(e) => setLocationData({ ...locationData, locationBuilding: e.target.value })}
            required
            sx={{ mb: 2, mt: 2 }}
          />
          <TextField
            label="Floor"
            fullWidth
            value={locationData.locationFloor}
            onChange={(e) => setLocationData({ ...locationData, locationFloor: e.target.value })}
            required
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseLocationDialog} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleAddLocation} variant="contained" color="primary" disabled={loading}>
            Add Location
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Inventory;