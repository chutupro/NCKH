// src/pages/map/mapLocationsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchMapLocations = createAsyncThunk(
  'mapLocations/fetchMapLocations',
  async () => {
    const response = await axios.get('http://localhost:3000/map-locations');
    
    // Log tất cả locations
    console.log('🔍 [Backend Response - ALL]', JSON.stringify(response.data, null, 2));
    
    // Log location 17 cụ thể
    const loc17 = response.data.find(p => p.LocationID === 17);
    if (loc17) {
      console.log('🎯 [Location 17 RAW]', JSON.stringify(loc17, null, 2));
    }
    
    const first = response.data[0];
    console.log('🔍 [Backend Response - FIRST]', {
      LocationID: first?.LocationID,
      Name: first?.Name,
      Image: first?.Image,
      ImageYear: first?.ImageYear,
      OldImage: first?.OldImage,
      OldImageYear: first?.OldImageYear,
      MainImageID: first?.MainImageID,
      OldImageID: first?.OldImageID,
    });
    
    return response.data.map(place => {
      const mapped = {
        id: place.LocationID,
        position: [place.Latitude, place.Longitude],
        title: place.Name,
        rating: place.Rating || 0,
        reviews: place.Reviews || 0,
        address: place.Address || '',
        image: place.Image || '',
        imageYear: place.imageYear || place.ImageYear || null,
        oldImage: place.OldImage || '',
        oldImageYear: place.oldImageYear || place.OldImageYear || null,
        desc: place.description || '',
        fullDesc: place.fullDescription || '',
        categoryId: place.CategoryID || null,
        categoryName: place.CategoryName || place.categoryName || 'Chưa phân loại',
      };
      
      if (place.LocationID === 17) {
        console.log('🎯 [Frontend Mapped Location 17]', {
          id: mapped.id,
          title: mapped.title,
          image: mapped.image,
          imageYear: mapped.imageYear,
          oldImage: mapped.oldImage,
          oldImageYear: mapped.oldImageYear,
        });
      }
      return mapped;
    });
  }
);

// Các thunk khác giữ nguyên
export const addMapLocation = createAsyncThunk(
  'mapLocations/addMapLocation',
  async (newLocation) => {
    const response = await axios.post('http://localhost:3000/map-locations', {
      id: newLocation.id || Date.now(),
      title: newLocation.title,
      latitude: newLocation.position[0],
      longitude: newLocation.position[1],
      rating: newLocation.rating,
      reviews: newLocation.reviews,
      address: newLocation.address,
      image: newLocation.image,
      imageYear: newLocation.imageYear,
      oldImage: newLocation.oldImage,
      oldImageYear: newLocation.oldImageYear,
      desc: newLocation.desc,
      fullDesc: newLocation.fullDesc,
      CategoryID: newLocation.categoryId,
    });
    return response.data;
  }
);

export const updateMapLocation = createAsyncThunk(
  'mapLocations/updateMapLocation',
  async (updatedLocation) => {
    const response = await axios.put(`http://localhost:3000/map-locations/${updatedLocation.id}`, {
      id: updatedLocation.id,
      title: updatedLocation.title,
      latitude: updatedLocation.position[0],
      longitude: updatedLocation.position[1],
      rating: updatedLocation.rating,
      reviews: updatedLocation.reviews,
      address: updatedLocation.address,
      image: updatedLocation.image,
      imageYear: updatedLocation.imageYear,
      oldImage: updatedLocation.oldImage,
      oldImageYear: updatedLocation.oldImageYear,
      desc: updatedLocation.desc,
      fullDesc: updatedLocation.fullDesc,
      CategoryID: updatedLocation.categoryId,
    });
    return response.data;
  }
);

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
        const index = state.places.findIndex(p => p.id === action.payload.id);
        if (index !== -1) state.places[index] = action.payload;
      })
      .addCase(deleteMapLocation.fulfilled, (state, action) => {
        state.places = state.places.filter(p => p.id !== action.payload);
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