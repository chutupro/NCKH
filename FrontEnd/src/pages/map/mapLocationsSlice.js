// src/pages/map/mapLocationsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchMapLocations = createAsyncThunk(
  'mapLocations/fetchMapLocations',
  async () => {
    const response = await axios.get('http://localhost:3000/map-locations');
    return response.data.map((loc) => ({
      id: loc.LocationID,
      title: loc.Name,
      address: loc.Address,
      position: [loc.Latitude, loc.Longitude],
      image: loc.Image,
      oldImage: loc.OldImage,
      desc: loc.description,           // ĐÃ ĐỔI
      fullDesc: loc.fullDescription,   // ĐÃ ĐỔI
      categoryId: loc.CategoryID,
      categoryName: loc.categoryName || 'Chưa phân loại',
      rating: loc.Rating || 0,
      reviews: loc.Reviews || 0,
    }));
  }
);

// addMapLocation, updateMapLocation giữ nguyên (đã đúng)
export const addMapLocation = createAsyncThunk(
  'mapLocations/addMapLocation',
  async (newLocation) => {
    const response = await axios.post('http://localhost:3000/map-locations', {
      title: newLocation.title,
      latitude: newLocation.position[0],
      longitude: newLocation.position[1],
      rating: newLocation.rating,
      reviews: newLocation.reviews,
      address: newLocation.address,
      image: newLocation.image,
      oldImage: newLocation.oldImage,
      desc: newLocation.desc,
      fullDesc: newLocation.fullDesc,
      categoryId: newLocation.categoryId,
    });
    return response.data;
  }
);

export const updateMapLocation = createAsyncThunk(
  'mapLocations/updateMapLocation',
  async (updatedLocation) => {
    const response = await axios.put(`http://localhost:3000/map-locations/${updatedLocation.id}`, {
      title: updatedLocation.title,
      latitude: updatedLocation.position[0],
      longitude: updatedLocation.position[1],
      rating: updatedLocation.rating,
      reviews: updatedLocation.reviews,
      address: updatedLocation.address,
      image: updatedLocation.image,
      oldImage: updatedLocation.oldImage,
      desc: updatedLocation.desc,
      fullDesc: updatedLocation.fullDesc,
      categoryId: updatedLocation.categoryId,
    });
    return response.data;
  }
);

// delete, feedback giữ nguyên
export const deleteMapLocation = createAsyncThunk(
  'mapLocations/deleteMapLocation',
  async (id) => {
    await axios.delete(`http://localhost:3000/map-locations/${id}`);
    return id;
  }
);

export const fetchFeedback = createAsyncThunk(
  'mapLocations/fetchFeedback',
  async (locationId) => {
    const response = await axios.get(`http://localhost:3000/map-locations/${locationId}/feedback`);
    return response.data;
  }
);

export const addFeedback = createAsyncThunk(
  'mapLocations/addFeedback',
  async ({ locationId, userId, rating, comment }) => {
    const response = await axios.post(`http://localhost:3000/map-locations/${locationId}/feedback`, {
      userId,
      rating,
      comment,
    });
    return response.data;
  }
);

const mapLocationsSlice = createSlice({
  name: 'mapLocations',
  initialState: {
    places: [],
    feedback: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMapLocations.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchMapLocations.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.places = action.payload;
      })
      .addCase(fetchMapLocations.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(addMapLocation.fulfilled, (state, action) => {
        state.places.push(action.payload);
      })
      .addCase(updateMapLocation.fulfilled, (state, action) => {
        const index = state.places.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) state.places[index] = action.payload;
      })
      .addCase(deleteMapLocation.fulfilled, (state, action) => {
        state.places = state.places.filter((p) => p.id !== action.payload);
      })
      .addCase(fetchFeedback.fulfilled, (state, action) => {
        state.feedback = action.payload;
      })
      .addCase(addFeedback.fulfilled, (state, action) => {
        state.feedback.push(action.payload);
      });
  },
});

export default mapLocationsSlice.reducer;