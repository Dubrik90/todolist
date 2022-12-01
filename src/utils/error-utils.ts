import {setErrorAC, SetErrorType, statusAC, StatusLoadingType} from "../state/app-reduscer";
import {Dispatch} from "redux";
import {ResponseType} from "../api/todolists-api";

export const handelServerAppError = <D>(dispatch: Dispatch, data: ResponseType<D>) => {
    if (data.messages.length) {
        dispatch(setErrorAC(data.messages[0]))
    } else {
        dispatch(setErrorAC('some error'))
    }
}

export const handelServerNetworkError = (dispatch: Dispatch<ErrorUtitlitsType>, error: {message: string}) => {
    dispatch(setErrorAC(error.message))
    dispatch(statusAC('idle'))
}

type ErrorUtitlitsType = SetErrorType | StatusLoadingType