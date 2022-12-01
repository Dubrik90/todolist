
type initialAppStateType = {
    status: StatusType,
    error: string | null
}
export type StatusType = 'idle' | 'loading' | 'succeeded' | 'failed'

const initialState: initialAppStateType = {
    status: 'loading',
    error: null
}

export const appReducer = (state: initialAppStateType = initialState, action: ActionsType): initialAppStateType => {
    switch (action.type) {
        case "APP/SET-STATUS": {
            return {...state, status: action.status}
        }
        case "APP/SET-ERROR": {
            return {...state, error: action.error}
        }
        default:
            return state;
    }
}

type ActionsType = SetErrorType | StatusLoadingType

export type SetErrorType = ReturnType<typeof setErrorAC>
export const setErrorAC = (error: null | string) => {
    return {
        type: 'APP/SET-ERROR',
        error
    } as const
}

export type StatusLoadingType = ReturnType<typeof statusAC>
export const statusAC = (status: StatusType) => {
    return {
        type: 'APP/SET-STATUS',
        status
    } as const
}



