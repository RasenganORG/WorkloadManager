import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import projectsService from "./projectsService.js";

const initialState = {
	projectList: null,
	isError: false,
	isSuccess: false,
	isLoading: true,
	message: ''


}

export const addProject = createAsyncThunk('projects/addProject', async (project, thunkAPI) => {
	try {
		return await projectsService.addProject(project)
	} catch (error) {
		const message =
			(error.response &&
				error.response.data &&
				error.response.data.message) ||
			error.message ||
			error.toString()
		return thunkAPI.rejectWithValue(message)
	}
})

export const getProjects = createAsyncThunk('projects/getProjects', async (project, thunkAPI) => {
	try {
		return await projectsService.getProjects()
	} catch (error) {
		const message =
			(error.response &&
				error.response.data &&
				error.response.data.message) ||
			error.message ||
			error.toString()
		return thunkAPI.rejectWithValue(message)
	}
})

export const projectsSlice = createSlice({
	name: 'projects',
	initialState,
	reducers: {
		reset: (state) => {
			state.isLoading = false
			state.isError = false
			state.isSuccess = false
			state.message = ''
		}
	},
	extraReducers: (builder) => {
		builder
			.addCase(getProjects.pending, (state) => {
				state.isLoading = true
			})
			.addCase(getProjects.fulfilled, (state, action) => {
				state.isLoading = false
				state.isSuccess = true
				state.projectList = action.payload
			})
			.addCase(getProjects.rejected, (state, action) => {
				state.isLoading = false
				state.isError = true
				state.message = action.payload
				state.projectList = null
			})
			.addCase(addProject.pending, (state) => {
				state.isLoading = true
			})
			.addCase(addProject.fulfilled, (state, action) => {
				state.isLoading = false
				state.isSuccess = true
			})
			.addCase(addProject.rejected, (state, action) => {
				state.isLoading = false
				state.isError = true
				state.message = action.payload
			})
 
	},
})

export const projectsActions = projectsSlice.actions;
export const { reset } = projectsSlice.actions
export default projectsSlice.reducer
