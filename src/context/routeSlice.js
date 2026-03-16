import { createSlice } from "@reduxjs/toolkit";


const RouteSlice = createSlice({
    name: "user",
    initialState: {
        route: "/calender",
    },
    reducers: {
        route: (state, action) => {
            state.route = action.payload
        },
    
    },
});

export const {route} = RouteSlice.actions
export default RouteSlice.reducer

