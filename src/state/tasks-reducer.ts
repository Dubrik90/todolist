import {TasksStateType} from '../App';
import {AddTodolistActionType, GetTodolistType, RemoveTodolistActionType} from './todolists-reducer';
import {
    ResultCode,
    TaskPriorities,
    TaskStatuses,
    TaskType,
    todolistsAPI,
    UpdateTaskModelType
} from '../api/todolists-api'
import {Dispatch} from "redux";
import {AppRootStateType} from "./store";
import {setErrorAC, SetErrorType, statusAC, StatusLoadingType} from "./app-reduscer";
import axios, {AxiosError} from "axios";

type ActionsType = RemoveTaskActionType
    | AddTaskActionType
    | UpdateTaskType
    | AddTodolistActionType
    | RemoveTodolistActionType
    | GetTodolistType
    | GetTasksType

const initialState: TasksStateType = {
    /*"todolistId1": [
        { id: "1", title: "CSS", status: TaskStatuses.New, todoListId: "todolistId1", description: '',
            startDate: '', deadline: '', addedDate: '', order: 0, priority: TaskPriorities.Low },
    ],
    "todolistId2": [
        { id: "1", title: "bread", status: TaskStatuses.New, todoListId: "todolistId2", description: '',
            startDate: '', deadline: '', addedDate: '', order: 0, priority: TaskPriorities.Low },
    ]*/
}

export const tasksReducer = (state: TasksStateType = initialState, action: ActionsType): TasksStateType => {
    switch (action.type) {
        case "GET-TASKS": {
            return {...state, [action.todoId]: action.tasks}
        }
        case "GET-TODO": {
            let copyState = {...state}
            action.todolists.forEach(el => {
                copyState[el.id] = []
            })
            return copyState
        }
        case 'REMOVE-TASK': {
            return {...state, [action.todolistId]: state[action.todolistId].filter(t => t.id !== action.taskId)}
        }
        case "ADD-TASK": {
            return {...state, [action.todolistId]: [action.task, ...state[action.todolistId]]}
        }
        case "UPDATE-TASK": {
            return {
                ...state,
                [action.todolistId]: state[action.todolistId].map(t => t.id === action.taskId ? {...t, ...action.tasks} : t)
            }
        }
        case 'ADD-TODOLIST': {
            return {...state, [action.todolist.id]: []}
        }
        case 'REMOVE-TODOLIST': {
            const copyState = {...state};
            delete copyState[action.id];
            return copyState;
        }
        default:
            return state;
    }
}
export type RemoveTaskActionType = ReturnType<typeof removeTaskAC>
export const removeTaskAC = (taskId: string, todolistId: string) => {
    return {type: 'REMOVE-TASK', taskId: taskId, todolistId: todolistId} as const
}

export type AddTaskActionType = ReturnType<typeof addTaskAC>
export const addTaskAC = (todolistId: string, task: TaskType) => {
    return {type: 'ADD-TASK', todolistId, task} as const
}

export type GetTasksType = ReturnType<typeof getTasksAC>
export const getTasksAC = (todoId: string, tasks: TaskType[]) => {
    return {
        type: "GET-TASKS",
        tasks,
        todoId
    } as const
}
export type UpdateTaskType = ReturnType<typeof updateTaskAC>
export const updateTaskAC = (todolistId: string, taskId: string, tasks: TaskType) => {
    return {
        type: 'UPDATE-TASK',
        todolistId,
        taskId,
        tasks
    } as const
}


export const getTasksTC = (todolistId: string) => (dispatch: Dispatch<ActionsType | StatusLoadingType>) => {
    dispatch(statusAC('loading'))
    todolistsAPI.getTasks(todolistId)
        .then((res) => {
            const data = res.data.items
            dispatch(getTasksAC(todolistId, data))
            dispatch(statusAC('succeeded'))
        })
}
export const deleteTaskTC = (todolistId: string, taskId: string) => async (dispatch: Dispatch<ActionsType | StatusLoadingType | SetErrorType>) => {
    dispatch(statusAC('loading'))
    try {
        await todolistsAPI.deleteTask(todolistId, taskId)
        dispatch(removeTaskAC(taskId, todolistId))
        dispatch(statusAC('succeeded'))
    } catch (e) {
        const err = e as Error | AxiosError
        if (axios.isAxiosError(err)) {
            const error = err.response?.data
                ? err.response.data
                : err.message
            dispatch(setErrorAC(error))
        }
        dispatch(statusAC('failed'))
    }
}
export const creatTaskTC = (todolistId: string, title: string) => (dispatch: Dispatch<ActionsType | StatusLoadingType | SetErrorType>) => {
    dispatch(statusAC('loading'))
    todolistsAPI.createTask(todolistId, title)
        .then((res) => {
            if (res.data.resultCode === ResultCode.OK) {
                let task = res.data.data.item
                dispatch(addTaskAC(todolistId, task))
                dispatch(statusAC('idle'))
            } else {
                if (res.data.messages.length) {
                    dispatch(setErrorAC(res.data.messages[0]))
                    dispatch(statusAC('idle'))
                } else {
                    dispatch(setErrorAC('some error'))
                }
                dispatch(statusAC('failed'))
            }
        })
        .catch((e: AxiosError) => {
            const error = e.response
                ? (e.response.data as { error: string }).error
                : e.message
            dispatch(setErrorAC(error))
            dispatch(statusAC('failed'))
        })
}

export type UpdateModelType = {
    title?: string
    description?: string
    status?: TaskStatuses
    priority?: TaskPriorities
    startDate?: string
    deadline?: string
}

export const updateTaskTC = (todoId: string, taskId: string, value: UpdateModelType) => (dispatch: Dispatch, getState: () => AppRootStateType) => {
    dispatch(statusAC('loading'))
    const task = getState().tasks[todoId].find(el => el.id === taskId)

    if (task) {
        const model = {
            ...task,
            ...value
        }
        todolistsAPI.updateTask(todoId, taskId, model)
            .then(res => {
                dispatch(updateTaskAC(todoId, taskId, res.data.data.item))
                dispatch(statusAC('succeeded'))
            })
    }
}












