import {todolistsAPI, TodolistType} from '../api/todolists-api'
import {Dispatch} from "redux";
import {setErrorAC, statusAC, StatusType} from "./app-reduscer";
import {AxiosError} from "axios";
import {handelServerAppError, handelServerNetworkError} from "../utils/error-utils";

type ActionsType = RemoveTodolistActionType
    | AddTodolistActionType
    | ChangeTodolistTitleActionType
    | ChangeTodolistFilterActionType
    | GetTodolistType
    | ChangeTodolistEntityStatusType

const initialState: Array<TodolistDomainType> = [
    /*{id: todolistId1, title: 'What to learn', filter: 'all', addedDate: '', order: 0},
    {id: todolistId2, title: 'What to buy', filter: 'all', addedDate: '', order: 0}*/
]

export type FilterValuesType = 'all' | 'active' | 'completed';
export type TodolistDomainType = TodolistType & {
    filter: FilterValuesType,
    entityStatus: StatusType
}

export const todolistsReducer = (state: Array<TodolistDomainType> = initialState, action: ActionsType): Array<TodolistDomainType> => {
    switch (action.type) {
        case "GET-TODO": {
            return action.todolists.map(el => ({...el, filter: "all", entityStatus: 'idle'}))
        }
        case 'REMOVE-TODOLIST': {
            return state.filter(tl => tl.id !== action.id)
        }
        case 'ADD-TODOLIST': {
            return [{...action.todolist, filter: "all", entityStatus: 'idle'}, ...state]
        }
        case 'CHANGE-TODOLIST-TITLE': {
            return state.map(el => el.id === action.id ? {...el, title: action.title} : el)
        }
        case 'CHANGE-TODOLIST-FILTER': {
            const todolist = state.find(tl => tl.id === action.id);
            if (todolist) {
                // если нашёлся - изменим ему заголовок
                todolist.filter = action.filter;
            }
            return [...state]
        }
        case "CHANGE-TODO-ENTITY-STATUS": {
            return state.map(el => el.id === action.todolistId ? {...el, entityStatus: action.entity} : el)
        }
        default:
            return state;
    }
}

export type RemoveTodolistActionType = ReturnType<typeof removeTodolistAC>
export const removeTodolistAC = (todolistId: string) => {
    return {type: 'REMOVE-TODOLIST', id: todolistId} as const
}

export type AddTodolistActionType = ReturnType<typeof addTodolistAC>
export const addTodolistAC = (todolist: TodolistType) => {
    return {type: 'ADD-TODOLIST', todolist} as const
}

export type ChangeTodolistTitleActionType = ReturnType<typeof changeTodolistTitleAC>
export const changeTodolistTitleAC = (id: string, title: string) => {
    return {type: 'CHANGE-TODOLIST-TITLE', id: id, title: title} as const
}

export type ChangeTodolistFilterActionType = ReturnType<typeof changeTodolistFilterAC>
export const changeTodolistFilterAC = (id: string, filter: FilterValuesType) => {
    return {type: 'CHANGE-TODOLIST-FILTER', id: id, filter: filter} as const
}

export type GetTodolistType = ReturnType<typeof getTodolistsAC>
export const getTodolistsAC = (todolists: TodolistType[]) => {
    return {
        type: "GET-TODO",
        todolists
    } as const
}
export type ChangeTodolistEntityStatusType = ReturnType<typeof changeTodolistEntityStatusAC>
export const changeTodolistEntityStatusAC = (todolistId: string, entity: StatusType) => {
    return {
        type: "CHANGE-TODO-ENTITY-STATUS",
        todolistId,
        entity
    } as const
}

export const getTodoTC = () => (dispatch: Dispatch) => {
    dispatch(statusAC('loading'))
    todolistsAPI.getTodolists()
        .then((res) => {
            const data = res.data
            dispatch(getTodolistsAC(data))
            dispatch(statusAC('succeeded'))
        })
}
export const removeTodolistTC = (todolistId: string) => (dispatch: Dispatch) => {
    dispatch(statusAC('loading'))
    dispatch(changeTodolistEntityStatusAC(todolistId, 'loading'))
    todolistsAPI.deleteTodolist(todolistId)
        .then((res) => {
            dispatch(removeTodolistAC(todolistId))
            dispatch(statusAC('succeeded'))
        })
        .catch(err => {
            dispatch(changeTodolistEntityStatusAC(todolistId, 'idle'))

        })

}

export const addTodolistTC = (title: string) => (dispatch: Dispatch) => {
    dispatch(statusAC('loading'))
    todolistsAPI.createTodolist(title)
        .then((res) => {
            if (res.data.resultCode === 0) {
                dispatch(addTodolistAC(res.data.data.item))
            } else {
                handelServerAppError(dispatch, res.data)
            }
        })
        .catch((e: AxiosError) => {
            handelServerNetworkError(dispatch, e)
        })

}
export const changeTodolistTitleTC = (id: string, title: string) => (dispatch: Dispatch) => {
    dispatch(statusAC('loading'))
    todolistsAPI.updateTodolist(id, title)
        .then((res) => {
            dispatch(changeTodolistTitleAC(id, title))
            dispatch(statusAC('succeeded'))
        })
}




