import { createSlice } from "@reduxjs/toolkit";


const PermissionSlice = createSlice({
    name: "user",
    initialState: {
        data: null,
    },
    reducers: {
        user: (state, action) => {
            state.data = action.payload
        },
    
    },
});

export const {user} = PermissionSlice.actions
export default PermissionSlice.reducer



// reducers: {
//     addPermission: (state, action) => {
//         state.permissions.push(action.payload);
//     },
//     removePermission: (state, action) => {
//         state.permissions = state.permissions.filter(
//             (permission) => permission !== action.payload
//         );
//     },
// },