import { createContext, useReducer } from "react"

export const AppReducer = (state, action) => {
    switch(action.type){
        case 'SET_EXTERNAL_DATA':
            let externalData = action.payload.externalData
            state.externalData = externalData
            action.type = 'DONE'
            return {
                ...state
            }
        case 'SET_SETTINGS':
            let settingsData = action.payload.settingsData
            state.settingsData = settingsData
            action.type = 'DONE'
            return {
                ...state
            }
        case 'SET_CURRENT_COMMAND':
            let currentCommand = action.payload.currentCommand
            state.currentCommand = currentCommand
            action.type = 'DONE'
            return {
                ...state
            };
        default:
            return state
    }
}

const initialState = {
    externalData: {},
    settingsData: {},
    currentCommand: ''
}

export const AppContext = createContext()

export const AppProvider = (props) => {
    const [state, dispatch] = useReducer(AppReducer, initialState);

    return (
        <AppContext.Provider
            value={{
                dispatch,
                externalData: state.externalData,
                settingsData: state.settingsData,
                currentCommand: state.currentCommand,
            }}
        >
            {props.children}
        </AppContext.Provider>
    )
}